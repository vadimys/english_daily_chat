const { Telegraf } = require('telegraf');
const { TELEGRAM_TOKEN } = require('./config');
require('./db'); // ініціалізує таблицю при старті

const bot = new Telegraf(TELEGRAM_TOKEN);

require('./handlers/commands')(bot);
require('./handlers/callbacks')(bot);
require('./cron')(bot);

bot.launch().then(() => {
    console.log('Бот запущено!');
});
