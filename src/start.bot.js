const { User } = require("../models/user.schema");

const StartBot = async (bot, Markup, ADMIN_ID) => {
  bot.start(async (ctx) => {
    try {
      const user_name = ctx.from?.first_name;
      const telegram_id = ctx.from?.id;

      if (ctx.from.is_bot) {
        return;
      }

      if (telegram_id == ADMIN_ID) {
        return ctx.reply(
          "Xush kelibsiz ADMIN",
          Markup.keyboard([
            { text: "📊 Ovozlarni ko'rish" },
            { text: "📤 Maktab qo'shish" },
            { text: "🗑 Maktab o'chirish" },
            { text: "📤 Kanal qo'shish" },
            { text: "🗑 Kanal o'chirish" },

          ]).resize()
        );
      }

      let userFind = await User.findOne({ telegram_id });

      if (!userFind) {
        await ctx.reply(
          `Botdan foydalanish uchun pastdagi "Raqamni yuborish" tugmasini bosing 👇`,
          Markup.keyboard([
            Markup.button.contactRequest(" 📞 Raqamni yuborish"),
          ]).resize()
        );
      } else {
        return ctx.reply(
          "Assalomu Alaykum. So‘rovnoma botga hush kelibsiz!",
          Markup.keyboard(["Ovoz berish"]).resize()
        );
      }
    } catch (error) {
      console.error(error.message);
    }
  });
};

module.exports = { StartBot };
