const { updateWordStatus } = require('../db');

module.exports = function(bot) {
    bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery.data;
        if (data.startsWith('learned_')) {
            const wordId = data.split('_')[1];
            updateWordStatus(wordId, 'learned');
            // Додаємо позначку до слова
            let oldText = ctx.update.callback_query.message.text;
            oldText = oldText.replace(/\s?<b>✅ Вивчене<\/b>/g, '');
            await ctx.editMessageText(oldText + ' <b>✅ Вивчене</b>', { parse_mode: 'HTML' });
            await ctx.editMessageReplyMarkup(); // прибрати кнопку
            ctx.answerCbQuery('Слово додано до словника як вивчене!');
        } else {
            ctx.answerCbQuery();
        }
    });
};
