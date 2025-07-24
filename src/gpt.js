const { OpenAI } = require('openai');
const { OPENAI_API_KEY } = require('./config');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function getWordsFromGPT(prompt) {
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 700,
    });
    return completion.choices[0].message.content;
}

module.exports = { getWordsFromGPT };
