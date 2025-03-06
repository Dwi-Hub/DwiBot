const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BOT_CHANNEL_NAME = "dwi-gemini-bot"; // Ubah sesuai dengan nama channel bot

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} sudah online!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Hindari bot merespons dirinya sendiri
    if (message.channel.name !== BOT_CHANNEL_NAME) return; // Pastikan bot hanya merespons di channel tertentu

    const userMessage = message.content;

    try {
        const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: userMessage }] }]
        });

        if (response.data.candidates && response.data.candidates.length > 0) {
            let botReply = response.data.candidates[0].content.parts[0].text;

            // Handle jika panjang pesan lebih dari 2000 karakter
            const MAX_MESSAGE_LENGTH = 2000;
            if (botReply.length > MAX_MESSAGE_LENGTH) {
                const messageChunks = botReply.match(/[\s\S]{1,2000}/g);
                for (const chunk of messageChunks) {
                    await message.reply(chunk);
                }
            } else {
                await message.reply(botReply);
            }

        } else {
            message.reply("⚠️ Maaf, tidak ada respons dari API Gemini.");
        }

    } catch (error) {
        console.error("❌ Error saat menghubungi API Gemini:", error.response?.data ?? error.message);
        message.reply("⚠️ Maaf, terjadi kesalahan saat menghubungi API Gemini.");
    }
});

// Jalankan bot dengan token dari environment variable
client.login(DISCORD_TOKEN);
