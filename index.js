const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');
const cron = require('node-cron');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const bot = new Telegraf(TELEGRAM_TOKEN);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// 1. Замініть на свій Telegram user ID
const userId = YOUR_TELEGRAM_USER_ID; // Наприклад: const userId = 123456789;

// Вітальне повідомлення
bot.start((ctx) => {
    ctx.reply('👋 Привіт! Я твій бот для вивчення англійських слів. Напиши /words, щоб отримати слова.');
    // Тимчасово — дізнатись свій ID:
    console.log('Your Telegram ID:', ctx.from.id);
});

// Ручна команда для отримання добірки
bot.command('words', async (ctx) => {
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
    } catch (e) {
        ctx.reply('❗ Помилка під час генерації. Спробуй ще раз.');
    }
});

// 2. Автоматична щоденна відправка добірки о 8:30 (6:30 UTC)
cron.schedule('30 6 * * *', async () => {
    try {
        const prompt = `
    Згенеруй список із 10 англійських слів (Intermediate). До кожного: переклад українською, приклад речення, коротка мотивація. Формат:
    1. слово – переклад
    Example: речення
    Motivation: мотивація
    `;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 600,
        });
        const words = completion.choices[0].message.content;
        await bot.telegram.sendMessage(userId, `🗓 Щоденна добірка англійських слів:\n\n${words}`);
    } catch (e) {
        await bot.telegram.sendMessage(userId, '❗ Помилка під час автоматичної відправки добірки.');
    }
});

// Запуск бота
bot.launch();
console.log('Бот запущено');
