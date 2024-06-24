const { School } = require("../models/school.schema");
const { User } = require("../models/user.schema");
const { Channel } = require("../models/channel.schema");
const fs = require("fs");

const OvozBot = async (bot, Markup) => {
  const about = fs.readFileSync("about.txt", "utf8");

  bot.hears("Ovoz berish", async (ctx) => {
    try {
      const telegram_id = ctx.from.id;

      console.log(telegram_id);
      const channels = await Channel.find();
      let isSubscribed = true;

      for (const channel of channels) {
        try {
          const chatMember = await ctx.telegram.getChatMember(channel.channel_url, telegram_id);
          console.log(chatMember);
          if (chatMember.status === "left" || chatMember.status === "kicked") {
            isSubscribed = false;
            console.log(channels, channel);
            break;
          }
        } catch (error) {
          if (error.response && error.response.description === 'Bad Request: chat not found') {
            await ctx.reply(`Kanal topilmadi: ${channel.channel_url}. Iltimos, to'g'ri URL kiritilganligini tekshiring.`);
            return;
          }
          throw error;
        }
      }

      if (!isSubscribed) {
        const subscribeButtons = channels.map(channel => [
          Markup.button.url("Kanalga a'zo bo'lish", `https://t.me/${channel.channel_url.slice(1)}`)
        ]);

        await ctx.reply(
          "Ovoz berish uchun telegram kanallarga a'zo bo‘ling 👇",
          Markup.inlineKeyboard([
            ...subscribeButtons,
            [Markup.button.callback("✅ Tekshirish", "check_subscription")],
          ])
        );
        return;
      }

      const schoolData = await School.find();

      const inlineKeyboard = schoolData.map((element) => {
        return [
          { text: element.school_name, callback_data: `vote_${element._id.toString()}` },
        ];
      });

      await ctx.replyWithPhoto(
        { source: "images/1.jpg" },
        {
          caption: about,
          reply_markup: {
            inline_keyboard: inlineKeyboard,
          },
        }
      );

      schoolData.forEach((element) => {
        bot.action(`vote_${element._id.toString()}`, async (ctx) => {
          try {
            const telegram_id = ctx.from.id;
            const schoolId = element._id;

            const userData = await User.findOne({ telegram_id });

            if (userData && userData.school_ref_id) {
              const existingSchool = await School.findById(userData.school_ref_id);
              if (existingSchool) {
                await ctx.reply("Siz allaqachon ovoz bergansiz.");
                return;
              }
            }

            await User.findOneAndUpdate(
              { telegram_id },
              { school_ref_id: schoolId },
              { new: true, upsert: true }
            );

            await ctx.reply(`Siz ${element.school_name} uchun ovoz berdingiz!`);
          } catch (error) {
            console.log(error.message);
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  });

 
  bot.action("check_subscription", async (ctx) => {
    try {
      const telegram_id = ctx.from.id;

      const channels = await Channel.find();
      let isSubscribed = true;

      for (const channel of channels) {
        try {
          const chatMember = await ctx.telegram.getChatMember(channel.channel_url, telegram_id);
          if (chatMember.status === "left" || chatMember.status === "kicked") {
            isSubscribed = false;
            break;
          }
        } catch (error) {
          if (error.response && error.response.description === 'Bad Request: chat not found') {
            await ctx.reply(`Kanal topilmadi: ${channel.channel_url}. Iltimos, to'g'ri URL kiritilganligini tekshiring.`);
            return;
          }
          throw error;
        }
      }

      if (!isSubscribed) {
        const subscribeButtons = channels.map(channel => [
          Markup.button.url("Kanalga a'zo bo'lish", `https://t.me/${channel.channel_url.slice(1)}`)
        ]);

        await ctx.reply(
          "Iltimos, barcha telegram kanallarga a'zo bo'ling 👇",
          Markup.inlineKeyboard([
            ...subscribeButtons,
            [Markup.button.callback("✅ Tekshirish", "check_subscription")],
          ])
        );
      } else {
        await ctx.reply("Rahmat! Endi ovoz berishingiz mumkin. 'Ovoz berish' tugmasini bosing.");
      }
    } catch (error) {
      console.log(error.message);
    }
  });
};

module.exports = { OvozBot };
