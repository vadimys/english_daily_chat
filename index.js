const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');
const cron = require('node-cron');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('Запускаємо бот із токеном:', !!TELEGRAM_TOKEN, 'і OpenAI ключем:', !!OPENAI_API_KEY);

const bot = new Telegraf(TELEGRAM_TOKEN);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Вкажи тут свій Telegram user ID
const userId = 367724841; // Наприклад: const userId = 123456789;

// Лог старту бота
console.log('Бот ініціалізовано.');

// Вітальна команда
bot.start((ctx) => {
    console.log('/start від', ctx.from.id);
    ctx.reply('👋 Привіт! Я твій бот для вивчення англійських слів. Напиши /words, щоб отримати слова.');
    // Тимчасово — можна побачити userId:
    console.log('User ID:', ctx.from.id);
});

// /words
bot.command('words', async (ctx) => {
    console.log('/words від', ctx.from.id);
    ctx.reply('⏳ Генерую добірку слів...');
    const prompt = `
  Згенеруй список із 10 англійських слів (Intermediate). До кожного: переклад українською, приклад речення, коротка мотивація. Формат:
  1. слово – переклад
  Example: речення
  Motivation: мотивація
  `;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
        });
        const words = completion.choices[0].message.content;
        ctx.reply(words);
        console.log('Добірку надіслано користувачу', ctx.from.id);
    } catch (e) {
        console.log('Помилка при /words:', e);
        ctx.reply('❗ Помилка під час генерації: ' + (e.message || e));
    }
});

// Callback buttons
bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
    console.log('callback_query:', data, 'від', ctx.from.id);

    if (data === 'remind_again') {
        ctx.reply('🔁 Надсилаю добірку ще раз...');
        const prompt = `
    Згенеруй список із 10 англійських слів (Intermediate). До кожного: переклад українською, приклад речення, коротка мотивація. Формат:
    1. слово – переклад
    Example: речення
    Motivation: мотивація
    `;
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 600,
            });
            const words = completion.choices[0].message.content;
            ctx.reply(words);
            console.log('Добірку (remind_again) надіслано користувачу', ctx.from.id);
        } catch (e) {
            console.log('Помилка при remind_again:', e);
            ctx.reply('❗ Помилка при повторному нагадуванні: ' + (e.message || e));
        }
    }

    if (data === 'skip_today') {
        ctx.reply('⏭ Сьогоднішнє нагадування пропущено.');
        console.log('Пропуск дня для', ctx.from.id);
    }

    ctx.answerCbQuery();
});

// Автоматична щоденна розсилка
cron.schedule('30 6 * * *', async () => {
    console.log('cron: Запускаємо щоденну добірку для', userId);
    const prompt = `
    Згенеруй список із 10 англійських слів (Intermediate). До кожного: переклад українською, приклад речення, коротка мотивація. Формат:
    1. слово – переклад
    Example: речення
    Motivation: мотивація
    `;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
        });
        const words = completion.choices[0].message.content;
        await bot.telegram.sendMessage(userId, `🗓 Щоденна добірка англійських слів:\n\n${words}`);
        console.log('cron: Добірку відправлено');
    } catch (e) {
        await bot.telegram.sendMessage(userId, '❗ Помилка під час автоматичної відправки добірки: ' + (e.message || e));
        console.log('cron: Помилка', e);
    }
});

bot.launch().then(() => {
    console.log('Бот запущено!');
});
