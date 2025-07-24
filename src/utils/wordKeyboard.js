function wordKeyboard(wordId) {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ Вивчене', callback_data: `learned_${wordId}` }
                ]
            ]
        }
    };
}

module.exports = { wordKeyboard };
