const startKeyboard = {
    reply_markup: {
        keyboard: [
            ['/words', '/help']
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

const worksKeyboard = {
    reply_markup: {
        keyboard: [
            ['/today', '/dictionary'],
            ['/help', '/unknown']
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
};

module.exports = { startKeyboard, mainKeyboard, worksKeyboard };
