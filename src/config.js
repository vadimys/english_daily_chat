module.exports = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    USER_ID: 367724841,
    prompt: `
Згенеруй список із 10 англійських слів рівня Intermediate для вивчення. Для кожного слова вкажи:
- слово та транскрипцію у квадратних дужках (наприклад: example [ɪgˈzɑːmpəl])
- переклад українською
- 1 приклад речення

Формат:

1. слово [транскрипція] — переклад
Example: приклад речення англійською
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
