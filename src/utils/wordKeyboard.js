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

function reWordKeyboard(wordId) {
    return {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ Вивчене', callback_data: `learned_${wordId}` }
                ]
            ],
            keyboard: [
                ['/words', '/today'],
                ['/dictionary', '/unknown'],
                ['/help']
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };
}

module.exports = { wordKeyboard, reWordKeyboard };
