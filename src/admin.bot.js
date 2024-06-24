const { Channel } = require("../models/channel.schema");
const { School } = require("../models/school.schema");
const { User } = require("../models/user.schema");

const adminState = {};

const AdminBot = async (bot, ADMIN_ID) => {
  bot.hears("📊 Ovozlarni ko'rish", async (ctx) => {
    try {
      const telegram_id = ctx.from?.id;

      if (telegram_id != ADMIN_ID) {
        return ctx.reply("Siz admin emassiz.");
      }

      const schools = await School.find();

      const userCounts = await User.aggregate([
        {
          $group: {
            _id: "$school_ref_id",
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "schools",
            localField: "_id",
            foreignField: "_id",
            as: "school",
          },
        },
        {
          $unwind: "$school",
        },
        {
          $project: {
            school_name: "$school.school_name",
            count: 1,
          },
        },
      ]);

      const voteSummary = schools
        .map((school) => {
          const countData = userCounts.find((count) =>
            count._id.equals(school._id)
          );
          const voteCount = countData ? countData.count : 0;
          return `${school.school_name}: ${voteCount} ovoz\n`;
        })
        .join("");

      await ctx.reply(`Ovozlar:\n${voteSummary}`);
    } catch (error) {
      console.log(error.message);
    }
  });

  bot.hears("📤 Maktab qo'shish", (ctx) => {
    const telegram_id = ctx.from?.id;

    if (telegram_id != ADMIN_ID) {
      return ctx.reply("Siz admin emassiz.");
    }

    adminState[telegram_id] = "addSchool";
    return ctx.reply("➕ Qo'shmoqchi bo'lgan maktab nomini yozing");
  });

  bot.hears("🗑 Maktab o'chirish", (ctx) => {
    const telegram_id = ctx.from?.id;

    if (telegram_id != ADMIN_ID) {
      return ctx.reply("Siz admin emassiz.");
    }

    adminState[telegram_id] = "removeSchool";
    return ctx.reply("➖ O'chirmoqchi bo'lgan maktab nomini yozing");
  });

  bot.hears("📤 Kanal qo'shish", (ctx) => {
    const telegram_id = ctx.from?.id;

    if (telegram_id != ADMIN_ID) {
      return ctx.reply("Siz admin emassiz.");
    }

    adminState[telegram_id] = "addChannel";
    return ctx.reply("➕ Qo'shmoqchi bo'lgan kanal URL-ni yozing");
  });

  bot.hears("🗑 Kanal o'chirish", (ctx) => {
    const telegram_id = ctx.from?.id;

    if (telegram_id != ADMIN_ID) {
      return ctx.reply("Siz admin emassiz.");
    }

    adminState[telegram_id] = "removeChannel";
    return ctx.reply("➖ O'chirmoqchi bo'lgan kanal URL-ni yozing");
  });

  bot.on("message", async (ctx) => {
    try {
      const telegram_id = ctx.from?.id;
      const telegram_message = ctx.message.text;

      if (telegram_id != ADMIN_ID) {
        return;
      }

      if (ctx.from.is_bot) {
        return;
      }

      const state = adminState[telegram_id];

      switch (state) {
        case "addSchool":
          await handleAddSchool(ctx, telegram_message);
          break;
        case "removeSchool":
          await handleRemoveSchool(ctx, telegram_message);
          break;
        case "addChannel":
          await handleAddChannel(ctx, telegram_message);
          break;
        case "removeChannel":
          await handleRemoveChannel(ctx, telegram_message);
          break;
        default:
          await ctx.reply("Iltimos, avval biror amalni tanlang.");
          break;
      }

      delete adminState[telegram_id];
    } catch (error) {
      if (error.code === 11000) {
        await ctx.reply(`Duplicate key error: ${error.message}`);
      } else {
        console.log(error.message);
      }
    }
  });
};

const handleAddSchool = async (ctx, telegram_message) => {
 

  const existingSchool = await School.findOne({
    school_name: telegram_message,
  });
  if (existingSchool) {
    await ctx.reply(`Maktab allaqachon mavjud: ${telegram_message}`);
    return;
  }

  const schoolData = await School.create({
    school_name: telegram_message,
  });
  await ctx.reply(`Maktab qo'shildi: ${telegram_message}`);
};

const handleRemoveSchool = async (ctx, telegram_message) => {
 

  const schoolData = await School.findOneAndDelete({
    school_name: telegram_message,
  });
  if (schoolData) {
    await ctx.reply(`Maktab o'chirildi: ${telegram_message}`);
  } else {
    await ctx.reply(`Maktab topilmadi: ${telegram_message}`);
  }
};

const handleAddChannel = async (ctx, telegram_message) => {
 
  const existingChannel = await Channel.findOne({
    channel_url: telegram_message,
  });
  if (existingChannel) {
    await ctx.reply(`Kanal allaqachon mavjud: ${telegram_message}`);
    return;
  }

  const channelData = await Channel.create({
    channel_url: telegram_message,
  });
  await ctx.reply(`Kanal qo'shildi: ${telegram_message}`);
};

const handleRemoveChannel = async (ctx, telegram_message) => {
 

  const channelData = await Channel.findOneAndDelete({
    channel_url: telegram_message,
  });
  if (channelData) {
    await ctx.reply(`Kanal o'chirildi: ${telegram_message}`);
  } else {
    await ctx.reply(`Kanal topilmadi: ${telegram_message}`);
  }
};

module.exports = { AdminBot };
