const { updateWordStatus } = require('../db');

module.exports = function(bot) {
    bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery.data;
        let newStatus = '';
        let mark = '';
        if (data.startsWith('learned_')) {
            const wordId = data.split('_')[1];
            updateWordStatus(wordId, 'learned');
            newStatus = '\n<b>✅ Вивчене</b>';
            mark = '✅';
        } else if (data.startsWith('unknown_')) {
            const wordId = data.split('_')[1];
            updateWordStatus(wordId, 'unknown');
            newStatus = '\n<b>❌ Не вивчене</b>';
            mark = '❌';
        } else {
            ctx.answerCbQuery();
            return;
        }
        // Оновлюємо текст повідомлення: додаємо позначку до слова
        let oldText = ctx.update.callback_query.message.text;
        oldText = oldText.replace(/\s?<b>✅ Вивчене<\/b>|\s?<b>❌ Не вивчене<\/b>/g, '');
        await ctx.editMessageText(oldText + newStatus, { parse_mode: 'HTML' });
        await ctx.editMessageReplyMarkup(); // Прибираємо кнопки
        ctx.answerCbQuery(`Статус слова змінено ${mark}`);
    });
};
