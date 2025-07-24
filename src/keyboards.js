const startKeyboard = {
    reply_markup: {
        keyboard: [
            ['/words', '/today'],
            ['/help']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
};

const mainKeyboard = {
    reply_markup: {
        keyboard: [
            ['/words', '/today'],
            ['/dictionary', '/unknown'],
            ['/help']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
};

module.exports = { startKeyboard, mainKeyboard };
