const { Telegraf, Markup } = require("telegraf");
const { DB } = require("./db/db.js");
const dotenv = require("dotenv");
 
const { AdminBot } = require("./src/admin.bot.js");
const { ContactBot } = require("./src/contact.bot.js");
const { OvozBot } = require("./src/ovoz.bot.js");
const { StartBot } = require("./src/start.bot.js");
dotenv.config();

const { BOT_TOKEN, ADMIN_ID} = process.env;

const bot = new Telegraf(BOT_TOKEN);

DB();

// ==================== START BOT ====================

StartBot(bot , Markup ,ADMIN_ID)

// ==================== CONTACT ====================

ContactBot(bot, Markup);

// ==================== OVOZ BERISH ====================

OvozBot(bot, Markup);
 
// ==================== FOR ADMIN ====================

AdminBot(bot, ADMIN_ID);


bot.launch();




