const cron = require('node-cron');
const { getWordsFromGPT } = require('./gpt');
const { parseWords } = require('./utils/parser');
const { saveWordsToDB, getUnknownWords, getWordsByDate } = require('./db');
const { prompt, USER_ID } = require('./config');
const { wordKeyboard } = require('./utils/wordKeyboard');

module.exports = function(bot) {
    // Щодня о 8:30 ранку
    cron.schedule('30 6 * * *', async () => {
        console.log('cron: Щоденна добірка для', USER_ID);

        // 1. Вибрати всі невивчені слова
        let unknownWords = await getUnknownWords(10);

        // 2. Якщо їх менше 10 — згенерувати додаткові нові
        if (unknownWords.length < 10) {
            const needToGenerate = 10 - unknownWords.length;
            try {
                const wordsText = await getWordsFromGPT(prompt);
                const wordsArray = parseWords(wordsText);

                // Вибрати лише ті, що ще не є у БД (щоб уникнути дублів)
                // Для простоти MVP: додаємо всі, далі можна оптимізувати перевірку дублікатів
                saveWordsToDB(wordsArray);

                // Отримуємо оновлений список невивчених (до 10-ти)
                unknownWords = await getUnknownWords(10);
            } catch (e) {
                await bot.telegram.sendMessage(
                    USER_ID,
                    '❗ Помилка при генерації нових слів: ' + (e.message || e)
                );
                console.log('cron: Помилка генерації нових слів', e);
            }
        }

        // 3. Надсилаємо слова у чат (кожне з кнопкою "Вивчене")
        if (unknownWords.length) {
            for (const word of unknownWords) {
                await bot.telegram.sendMessage(
                    USER_ID,
                    `<b>${word.word}</b> [${word.transcription}] — <i>${word.translation}</i>\nExample: ${word.example}`,
                    { ...wordKeyboard(word.id), parse_mode: 'HTML' }
                );
            }
            console.log('cron: Слова надіслано користувачу');
        } else {
            await bot.telegram.sendMessage(
                USER_ID,
                'Усі слова вивчені! 🎉 Можеш викликати /words для нової генерації.'
            );
            console.log('cron: Немає слів для відправки');
        }
    });
};
