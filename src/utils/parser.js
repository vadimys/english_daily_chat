function parseWords(gptResponse) {
    const lines = gptResponse.split('\n').map(line => line.trim()).filter(Boolean);
    const words = [];

    for (let i = 0; i < lines.length; i += 2) {
        const line = lines[i];
        const exampleLine = lines[i + 1];
        const match = line.match(/^\d+\.\s(.+?)\s\[(.+?)\]\s—\s(.+)$/);
        if (match && exampleLine && exampleLine.startsWith('Example:')) {
            const [, word, transcription, translation] = match;
            const example = exampleLine.replace('Example:', '').trim();
            words.push({ word, transcription, translation, example });
        }
    }
    return words;
}

module.exports = { parseWords };
