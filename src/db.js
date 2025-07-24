const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dictionary.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS words
        (
            id
            INTEGER
            PRIMARY
            KEY
            AUTOINCREMENT,
            word
            TEXT,
            transcription
            TEXT,
            translation
            TEXT,
            example
            TEXT,
            date_sent
            TEXT,
            status
            TEXT
            DEFAULT
            'unknown'
        )
    `);
});

function saveWordsToDB(wordsArray) {
    const now = new Date().toISOString().split('T')[0];
    wordsArray.forEach(w => {
        db.run(
            `INSERT INTO words (word, transcription, translation, example, date_sent, status)
             VALUES (?, ?, ?, ?, ?, 'unknown')`,
            [w.word, w.transcription, w.translation, w.example, now]
        );
    });
}

// Отримати всі вивчені слова
function getLearnedWords() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT word, transcription, translation
                FROM words
                WHERE status = 'learned'
                GROUP BY word, transcription, translation`, [], (err, rows) => {
            if (err) return reject(err);
            if (!rows.length) return resolve('Твій словник поки порожній.');
            const text = rows.map((w, idx) => `<b>${w.word}</b> [${w.transcription}] — <i>${w.translation}</i>`).join('\n');
            resolve('📚 Твій словник:\n\n' + text);
        });
    });
}

// Отримати всі невивчені слова (до 10)
function getUnknownWords(limit = 10) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT *
                FROM words
                WHERE status = 'unknown' LIMIT ?`, [limit], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// Позначити слово як вивчене/невивчене
function updateWordStatus(wordId, status) {
    db.run(`UPDATE words
            SET status = ?
            WHERE id = ?`, [status, wordId]);
}

function getWordsByDate(date) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT *
                FROM words
                WHERE date_sent = ?
                  AND status = 'unknown'`, [date], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

module.exports = {saveWordsToDB, getLearnedWords, getUnknownWords, updateWordStatus, getWordsByDate};
