const { User } = require("../models/user.schema");

const ContactBot = async (bot, Markup) => {
  bot.on("contact", async (ctx) => {
    try {
      const telegram_id = ctx.from.id;
      const user_name = ctx.from.username || "";
      const phone_number = ctx.message.contact.phone_number;

      let userData = await User.findOne({ telegram_id });

      if (!userData) {
        userData = new User({
          schools_ref_id: "",
          user_name,
          telegram_id,
          phone_number,
        });

        await userData.save();


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

module.exports = { ContactBot };
