require('dotenv').config();

module.exports = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    USER_ID: 367724841,
    prompt: `
`,
    extraKeyboard: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "🔁 Нагадати ще раз", callback_data: "remind_again" },
                    { text: "⏭ Пропустити сьогодні", callback_data: "skip_today" }
                ]
            ]
        }
    }
};
