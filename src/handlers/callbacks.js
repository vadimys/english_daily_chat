const { updateWordStatus } = require('../db');

module.exports = function(bot) {
    bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery.data;
        if (data.startsWith('learned_')) {
            const wordId = data.split('_')[1];
            updateWordStatus(wordId, 'learned');
            ctx.editMessageReplyMarkup(); // прибирає кнопки
            ctx.reply('Слово додано до словника як вивчене!');
        } else if (data.startsWith('unknown_')) {
            const wordId = data.split('_')[1];
            updateWordStatus(wordId, 'unknown');
            ctx.editMessageReplyMarkup();
            ctx.reply('Слово залишилось у списку невивчених!');
        }
        ctx.answerCbQuery();
    });
};
