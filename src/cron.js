const cron = require('node-cron');
const {getWordsFromGPT} = require('./gpt');
const {parseWords} = require('./utils/parser');
const {saveWordsToDB, getUnknownWords} = require('./db');
const {prompt, USER_ID, WORDS_AMOUNT} = require('./config');
const {wordKeyboard} = require('./utils/wordKeyboard');

module.exports = function (bot) {
    cron.schedule('30 6 * * *', async () => {
        console.log('cron: Щоденна добірка для', USER_ID);

        let unknownWords = await getUnknownWords(WORDS_AMOUNT);

        if (unknownWords.length < WORDS_AMOUNT) {
            const needToGenerate = WORDS_AMOUNT - unknownWords.length;

            try {
                const countPrompt = prompt.replace('${count}', needToGenerate);
                const wordsText = await getWordsFromGPT(countPrompt);
                const wordsArray = parseWords(wordsText);

                saveWordsToDB(wordsArray);
                unknownWords = await getUnknownWords(WORDS_AMOUNT);
            } catch (e) {
                await bot.telegram.sendMessage(
                    USER_ID,
                    '❗ Помилка при генерації нових слів: ' + (e.message || e)
                );
                console.log('cron: Помилка генерації нових слів', e);
            }
        }

        if (unknownWords.length) {
            for (const word of unknownWords) {
                await bot.telegram.sendMessage(
                    USER_ID,
                    `<b>${word.word}</b> [${word.transcription}] — <i>${word.translation}</i>\n${word.example}`,
                    {...wordKeyboard(word.id), parse_mode: 'HTML'}
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
