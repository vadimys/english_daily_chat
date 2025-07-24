const { Telegraf } = require('telegraf');
const { OpenAI } = require('openai');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const bot = new Telegraf(TELEGRAM_TOKEN);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

bot.start((ctx) => {
    ctx.reply('👋 Привіт! Я твій бот для вивчення англійських слів. Напиши /words, щоб отримати слова.');
});

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

bot.launch();
console.log('Бот запущено');
