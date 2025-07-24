const cron = require('node-cron');
const { getWordsFromGPT } = require('./gpt');
const { parseWords } = require('./utils/parser');
const { saveWordsToDB } = require('./db');
const { prompt, extraKeyboard, USER_ID } = require('./config');

module.exports = function(bot) {
    cron.schedule('30 6 * * *', async () => {
        console.log('cron: Запускаємо щоденну добірку для', USER_ID);
        try {
            const wordsText = await getWordsFromGPT(prompt);
            await bot.telegram.sendMessage(
                USER_ID,
                `🗓 Щоденна добірка англійських слів:\n\n${wordsText}`,
                extraKeyboard
            );
            const wordsArray = parseWords(wordsText);
            saveWordsToDB(wordsArray);
            console.log('cron: Добірку відправлено');
        } catch (e) {
            await bot.telegram.sendMessage(
                USER_ID,
                '❗ Помилка під час автоматичної відправки добірки: ' + (e.message || e)
            );
            console.log('cron: Помилка', e);
        }
    });
};
