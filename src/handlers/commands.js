const { getWordsFromGPT } = require('../gpt');
const { parseWords } = require('../utils/parser');
const { saveWordsToDB, getLearnedWords, getUnknownWords, getWordsByDate } = require('../db');
const { prompt, WORDS_AMOUNT } = require('../config');
const { wordKeyboard, reWordKeyboard } = require('../utils/wordKeyboard');
const { startKeyboard, mainKeyboard, worksKeyboard } = require('../keyboards');

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
        const unknownWords = await getUnknownWords(WORDS_AMOUNT);
        if (unknownWords.length > 0) {
            await ctx.reply('⏳ Надсилаю невивчені слова...', worksKeyboard);
            for (const word of unknownWords) {
                await ctx.reply(
                    `<b>${word.word}</b> [${word.transcription}] — <i>${word.translation}</i>\n${word.example}`,
                    { ...wordKeyboard(word.id), parse_mode: 'HTML' }
                );
            }
        } else {
            await ctx.reply('⏳ Генерую нову добірку слів...', worksKeyboard);

            try {
                const countPrompt = prompt.replace('${count}', WORDS_AMOUNT);
                const wordsText = await getWordsFromGPT(countPrompt);
                const wordsArray = await parseWords(wordsText);
                const now = new Date().toISOString().split('T')[0];
                console.log('GPT wordsArray:', wordsArray.length, wordsArray);
                await saveWordsToDB(wordsArray, now);
                console.log('Збережено у БД:', wordsArray.length);

                const newWords = await getWordsByDate(now);
                console.log('Отримано з БД:', newWords.length);

                for (const w of newWords) {
                    await ctx.reply(
                        `<b>${w.word}</b> [${w.transcription}] — <i>${w.translation}</i>\n${w.example}`,
                        { ...wordKeyboard(w.id), parse_mode: 'HTML' }
                    );
                }
            } catch (e) {
                ctx.reply('❗ Помилка під час генерації: ' + (e.message || e), mainKeyboard);
            }
        }
    });

    bot.command('today', async (ctx) => {
        const words = await getUnknownWords(100);
        if (!words.length) return ctx.reply('Всі слова на сьогодні вже вивчені! Використай /words для нової добірки.', mainKeyboard);
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
