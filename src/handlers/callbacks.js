const { getWordsFromGPT } = require('../gpt');
const { parseWords } = require('../utils/parser');
const { saveWordsToDB } = require('../db');
const { prompt, extraKeyboard } = require('../config');

module.exports = function(bot) {
    bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery.data;
        console.log('callback_query:', data, 'від', ctx.from.id);

        if (data === 'remind_again') {
            ctx.reply('🔁 Надсилаю добірку ще раз...');
            try {
                const wordsText = await getWordsFromGPT(prompt);
                ctx.reply(wordsText, extraKeyboard);
                const wordsArray = parseWords(wordsText);
                saveWordsToDB(wordsArray);
            } catch (e) {
                ctx.reply('❗ Помилка при повторному нагадуванні: ' + (e.message || e));
            }
        }

        if (data === 'skip_today') {
            ctx.reply('⏭ Сьогоднішнє нагадування пропущено.');
            console.log('Пропуск дня для', ctx.from.id);
        }

        ctx.answerCbQuery();
    });
};
