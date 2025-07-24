const { getWordsFromGPT } = require('../gpt');
const { parseWords } = require('../utils/parser');
const { saveWordsToDB, getLearnedWords, getUnknownWords } = require('../db');
const { prompt } = require('../config');
const { wordKeyboard } = require('../utils/wordKeyboard');
const { startKeyboard, mainKeyboard } = require('../keyboards');

module.exports = function(bot) {
    bot.start((ctx) => {
        ctx.reply(
            '👋 Привіт! Я твій бот для вивчення англійських слів.\n\nВикористовуй /help, щоб побачити доступні команди.',
            startKeyboard
        );
    });

    bot.command('help', (ctx) => {
        ctx.reply(
            `<b>Доступні команди:</b>
/words — слова для вивчення на сьогодні (невивчені, якщо є, або нові)
/today — всі слова на сьогодні списком
/dictionary — твій словник (усі позначені як вивчені)
/unknown — список невивчених слів
/help — довідка по командам

Вибирай команди натисканням на кнопки внизу екрану.`,
            { ...mainKeyboard, parse_mode: 'HTML' }
        );
    });

    bot.command('words', async (ctx) => {
        const unknownWords = await getUnknownWords(10);
        if (unknownWords.length > 0) {
            ctx.reply('⏳ Надсилаю невивчені слова...', mainKeyboard);
            for (const word of unknownWords) {
                await ctx.reply(
                    `<b>${word.word}</b> [${word.transcription}] — <i>${word.translation}</i>\nExample: ${word.example}`,
                    { ...wordKeyboard(word.id), parse_mode: 'HTML' }
                );
            }
        } else {
            ctx.reply('⏳ Генерую нову добірку слів...', mainKeyboard);
            try {
                const wordsText = await getWordsFromGPT(prompt);
                const wordsArray = parseWords(wordsText);
                saveWordsToDB(wordsArray);
                for (const w of wordsArray) {
                    await ctx.reply(
                        `<b>${w.word}</b> [${w.transcription}] — <i>${w.translation}</i>\nExample: ${w.example}`,
                        { ...mainKeyboard, parse_mode: 'HTML' }
                    );
                }
            } catch (e) {
                ctx.reply('❗ Помилка під час генерації: ' + (e.message || e), mainKeyboard);
            }
        }
    });

    bot.command('today', async (ctx) => {
        const words = await getUnknownWords(10);
        if (!words.length) return ctx.reply('Всі слова на сьогодні вже розібрано. Використай /words для нової добірки.', mainKeyboard);
        const text = words.map((w, idx) =>
            `${idx+1}. <b>${w.word}</b> [${w.transcription}] — <i>${w.translation}</i>`).join('\n');
        ctx.reply('📝 Слова на сьогодні:\n\n' + text, { ...mainKeyboard, parse_mode: 'HTML' });
    });

    bot.command('dictionary', async (ctx) => {
        try {
            const text = await getLearnedWords();
            ctx.reply(text, { ...mainKeyboard, parse_mode: 'HTML' });
        } catch (e) {
            ctx.reply('❗ Помилка при отриманні словника: ' + (e.message || e), mainKeyboard);
        }
    });

    bot.command('unknown', async (ctx) => {
        try {
            const words = await getUnknownWords(100);
            if (!words.length) return ctx.reply('Немає невивчених слів!', mainKeyboard);
            const text = words.map((w, idx) => `${idx+1}. <b>${w.word}</b> [${w.transcription}] — <i>${w.translation}</i>`).join('\n');
            ctx.reply('❌ Невивчені слова:\n\n' + text, { ...mainKeyboard, parse_mode: 'HTML' });
        } catch (e) {
            ctx.reply('❗ Помилка при отриманні невивчених слів: ' + (e.message || e), mainKeyboard);
        }
    });
};
