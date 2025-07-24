const { getWordsFromGPT } = require('../gpt');
const { parseWords } = require('../utils/parser');
const { saveWordsToDB, getDictionary } = require('../db');
const { prompt, extraKeyboard } = require('../config');

module.exports = function(bot) {
    bot.start((ctx) => {
        ctx.reply('👋 Привіт! Я твій бот для вивчення англійських слів. Напиши /words, щоб отримати слова.');
        console.log('/start від', ctx.from.id);
    });

    bot.command('words', async (ctx) => {
        ctx.reply('⏳ Генерую добірку слів...');
        try {
            const wordsText = await getWordsFromGPT(prompt);
            ctx.reply(wordsText, extraKeyboard);
            const wordsArray = parseWords(wordsText);
            saveWordsToDB(wordsArray);
        } catch (e) {
            ctx.reply('❗ Помилка під час генерації: ' + (e.message || e));
        }
    });

    bot.command('dictionary', async (ctx) => {
        try {
            const text = await getDictionary();
            ctx.reply(text);
        } catch (e) {
            ctx.reply('❗ Помилка при отриманні словника: ' + (e.message || e));
        }
    });
};
