const axios = require("axios");
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const {
  getToken,
  getInstance,
  stopInstance,
  startInstance,
} = require("./services");
const token = process.env.TOKEN;
const mainChat = +process.env.CHAT_ID;
let idLastProposal;

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;

  if (chatId !== mainChat || message.toLowerCase() !== "відпустка") {
    return;
  }
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Що з сервером?", callback_data: "status" }],
        [
          { text: "Вимкнути", callback_data: "powerOff", style: "danger" },
          { text: "Увімкнути", callback_data: "powerOn" },
        ],
      ],
    },
  };
  const proposal = await bot.sendMessage(chatId, "Що зробити?", options);
  idLastProposal = proposal.message_id;
  setTimeout(async () => {
    try {
      let id = idLastProposal + 10;
      while (id - idLastProposal > -20) {
        try {
          await bot.deleteMessage(chatId, id);
        } catch (error) {}
        id -= 1;
      }
    } catch (error) {
      console.error(error);
    }
  }, 5000);
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  const token = await getToken();
  const instances = await getInstance(token);
  const instance = instances.data[0];
  const { instanceId, status } = instance;

  switch (data) {
    case "status":
      bot.sendMessage(chatId, `Status server "${instanceId}": ${status} 🟢`);
      break;
    case "powerOff":
      const stop = await stopInstance(token, instanceId);
      bot.sendMessage(chatId, `Stoped server "${instanceId}" 🔴`);
      break;
    case "powerOn":
      const start = await startInstance(token, instanceId);
      bot.sendMessage(chatId, `Starts server "${instanceId}" 🟡`);
      break;
    default:
      bot.sendMessage(chatId, `Не знаю таку команду`);
  }
  // setTimeout(async () => {
  //   try {
  //     let id = idLastProposal + 2;
  //     while (id - idLastProposal > -10) {
  //       try {
  //         await bot.deleteMessage(chatId, id);
  //       } catch (error) {}
  //       id -= 1;
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, 5000);
});
