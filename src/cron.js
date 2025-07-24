const cron = require('node-cron');
const { getWordsFromGPT } = require('./gpt');
const { parseWords } = require('./utils/parser');
const { saveWordsToDB, getUnknownWords } = require('./db');
const { prompt, USER_ID } = require('./config');
const { wordKeyboard } = require('./utils/wordKeyboard');

module.exports = function(bot) {
    cron.schedule('30 6 * * *', async () => {
        console.log('cron: Перевіряємо невивчені слова для', USER_ID);
        const unknownWords = await getUnknownWords(10);
        if (unknownWords.length > 0) {
            for (const word of unknownWords) {
                await bot.telegram.sendMessage(
                    USER_ID,
                    `${word.word} [${word.transcription}] — ${word.translation}\nExample: ${word.example}`,
                    wordKeyboard(word.id)
                );
            }
        } else {
            try {
                const wordsText = await getWordsFromGPT(prompt);
                const wordsArray = parseWords(wordsText);
                saveWordsToDB(wordsArray);
                for (const w of wordsArray) {
                    await bot.telegram.sendMessage(
                        USER_ID,
                        `${w.word} [${w.transcription}] — ${w.translation}\nExample: ${w.example}`,
                        wordKeyboard(null) // як і вище: для MVP можна без id, або оновити saveWordsToDB
                    );
                }
                console.log('cron: Надіслано нову добірку слів');
            } catch (e) {
                await bot.telegram.sendMessage(
                    USER_ID,
                    '❗ Помилка під час автоматичної відправки добірки: ' + (e.message || e)
                );
                console.log('cron: Помилка', e);
            }
        }
    });
};
