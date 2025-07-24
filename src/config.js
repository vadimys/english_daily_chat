module.exports = {
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    WORDS_AMOUNT: 10,
    USER_ID: 367724841,
    prompt: `
Згенеруй список із ${'${count}'} англійських слів рівня Intermediate для вивчення. Для кожного слова вкажи:
- слово та транскрипцію у квадратних дужках (наприклад: example [ɪgˈzɑːmpəl])
- переклад українською
- 1 приклад речення

Формат:

1. слово [транскрипція] — переклад
Example: приклад речення англійською

`
};
