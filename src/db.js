const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dictionary.db');

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT,
      transcription TEXT,
      translation TEXT,
      example TEXT,
      date_sent TEXT
    )
  `);
});

function saveWordsToDB(wordsArray) {
    const now = new Date().toISOString().split('T')[0];
    wordsArray.forEach(w => {
        db.run(
            `INSERT INTO words (word, transcription, translation, example, date_sent) VALUES (?, ?, ?, ?, ?)`,
            [w.word, w.transcription, w.translation, w.example, now]
        );
    });
}

function getDictionary() {
    return new Promise((resolve, reject) => {
        db.all('SELECT word, transcription, translation FROM words GROUP BY word, transcription, translation', [], (err, rows) => {
            if (err) return reject(err);
            if (!rows.length) return resolve('Твій словник поки порожній.');
            const text = rows.map((r, idx) => `${idx+1}. ${r.word} [${r.transcription}] — ${r.translation}`).join('\n');
            resolve('📚 Твій словник:\n\n' + text);
        });
    });
}

module.exports = { saveWordsToDB, getDictionary };
