const { getWordsFromGPT } = require('../gpt');
const { parseWords } = require('../utils/parser');
const { saveWordsToDB, getLearnedWords, getUnknownWords } = require('../db');
const { prompt } = require('../config');
const { wordKeyboard } = require('../utils/wordKeyboard');

module.exports = function(bot) {
    bot.start((ctx) => {
        ctx.reply('👋 Привіт! Я твій бот для вивчення англійських слів. Напиши /words, щоб отримати слова.');
        console.log('/start від', ctx.from.id);
    });

    bot.command('words', async (ctx) => {
        // 1. Перевіряємо невивчені слова
        const unknownWords = await getUnknownWords(10);
        if (unknownWords.length > 0) {
            ctx.reply('⏳ Надсилаю невивчені слова...');
            for (const word of unknownWords) {
                await ctx.reply(
                    `${word.word} [${word.transcription}] — ${word.translation}\nExample: ${word.example}`,
                    wordKeyboard(word.id)
                );
            }
        } else {
            // 2. Якщо нема — генеруємо нові
            ctx.reply('⏳ Генерую нову добірку слів...');
            try {
                const wordsText = await getWordsFromGPT(prompt);
                const wordsArray = parseWords(wordsText);
                saveWordsToDB(wordsArray);
                for (const w of wordsArray) {
                    await ctx.reply(
                        `${w.word} [${w.transcription}] — ${w.translation}\nExample: ${w.example}`,
                        wordKeyboard(null) // wordId з’явиться після вставки в БД, тут для MVP можна спростити, або оновити saveWordsToDB, щоб вертати id
                    );
                }
            } catch (e) {
                ctx.reply('❗ Помилка під час генерації: ' + (e.message || e));
            }
        }
    });

    bot.command('dictionary', async (ctx) => {
        try {
            const text = await getLearnedWords();
            ctx.reply(text);
        } catch (e) {
            ctx.reply('❗ Помилка при отриманні словника: ' + (e.message || e));
        }
    });

    bot.command('unknown', async (ctx) => {
        try {
            const words = await getUnknownWords(100);
            if (!words.length) return ctx.reply('Немає невивчених слів!');
            const text = words.map((w, idx) => `${idx+1}. ${w.word} [${w.transcription}] — ${w.translation}`).join('\n');
            ctx.reply('❌ Невивчені слова:\n\n' + text);
        } catch (e) {
            ctx.reply('❗ Помилка при отриманні невивчених слів: ' + (e.message || e));
        }
    });

    const { getUnknownWords } = require('../db');

    bot.command('today', async (ctx) => {
        const words = await getUnknownWords(10);
        if (!words.length) return ctx.reply('Всі слова на сьогодні вже розібрано. Використай /words для нової добірки.');
        const text = words.map((w, idx) =>
            `${idx+1}. ${w.word} [${w.transcription}] — ${w.translation}`).join('\n');
        ctx.reply('📝 Слова на сьогодні:\n\n' + text);
    });

    bot.command('help', (ctx) => {
        ctx.reply(
            `📋 *Доступні команди:*
            /words — слова для вивчення на сьогодні (невивчені, якщо є, або нові)
            /dictionary — твій словник (усі позначені як вивчені)
            /unknown — список невивчених слів
            /help — довідка по командам

            Під кожним словом обирай, чи воно "Вивчене" чи "Не вивчене", натискаючи відповідну кнопку.`
            , { parse_mode: 'Markdown' });
    });
};
