const axios = require('axios');
require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  REST, 
  Routes,
  PermissionFlagsBits
} = require('discord.js');
const crypto = require('crypto');
const express = require('express');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus 
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

// =============== ط¥ط¹ط¯ط§ط¯ ط³ظٹط±ظپط± ط§ظ„ظˆظٹط¨ (ظ„ط¥ط¨ظ‚ط§ط، ط§ظ„ط¨ظˆطھ ط´ط؛ط§ظ„ 24/7 ظ…ط¬ط§ظ†ط§ظ‹) ===============
const webServer = express();
webServer.get('/', (req, res) => res.send('T3N Bot is Alive 24/7!'));
const PORT = process.env.PORT || 3000;
webServer.listen(PORT, () => console.log(`ًںڑ€ Keep-Alive Web Server is running on port ${PORT}`));

                    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                    images.push(base64Image);
                } catch (err) {
                    console.error('â‌Œ Failed to download image:', err.message);
                }
            }
        }
    }

    let history = conversationHistory.get(message.author.id) || [
        { role: "system", content: SYSTEM_INSTRUCTION }
    ];

    const userMessage = { role: "user", content: message.content || (images.length > 0 ? "ط­ظ„ظ„ ظ‡ط°ظ‡ ط§ظ„طµظˆط±ط©" : "") };
    if (images.length > 0) {
        userMessage.images = images;
    }
    history.push(userMessage);

    if (history.length > 11) history.splice(1, history.length - 11);

    try {
        const response = await axios.post(AI_API_URL, {
            model: AI_MODEL,
            messages: history,
            stream: false
        }, {
            headers: { 'Authorization': \`Bearer \${AI_API_KEY}\`, 'Content-Type': 'application/json' },
            timeout: 90000 
        });

        const aiReply = response.data.message.content;
        history.push({ role: "assistant", content: aiReply });
        conversationHistory.set(message.author.id, history);

        await message.reply(aiReply);
    } catch (error) {
        console.error('â‌Œ AI Chat API Error:', error.message);
    }
});


                    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                    images.push(base64Image);
                } catch (err) {
                    console.error('â‌Œ Failed to download image:', err.message);
                }
            }
        }
    }

    let history = conversationHistory.get(message.author.id) || [
        { role: "system", content: SYSTEM_INSTRUCTION }
    ];

    const userMessage = { role: "user", content: message.content || (images.length > 0 ? "ط­ظ„ظ„ ظ‡ط°ظ‡ ط§ظ„طµظˆط±ط©" : "") };
    if (images.length > 0) {
        userMessage.images = images;
    }
    history.push(userMessage);

    if (history.length > 11) history.splice(1, history.length - 11);

    try {
        const response = await axios.post(AI_API_URL, {
            model: AI_MODEL,
            messages: history,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 90000 
        });

        const aiReply = response.data.message.content;
        history.push({ role: "assistant", content: aiReply });
        conversationHistory.set(message.author.id, history);

        await message.reply(aiReply);
    } catch (error) {
        console.error('â‌Œ AI Chat API Error:', error.response ? error.response.data : error.message);
        await message.reply("ظ…ط¹ظ„ظٹط´ ظٹط§ ظˆط­ط´طŒ ط§ظ„ظ†ط¸ط§ظ… ظˆط§ط¬ظ‡ ظ…ط´ظƒظ„ط© ظ„ط­ط¸ظٹط©طŒ ظٹط±ط¬ظ‰ ط§ظ„ظ…ط­ط§ظˆظ„ط© ط¨ط¹ط¯ ظ‚ظ„ظٹظ„. âڑ™ï¸ڈ");
    }
});


                    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                    images.push(base64Image);
                } catch (err) {
                    console.error('â‌Œ Failed to download image:', err.message);
                }
            }
        }
    }

    let history = conversationHistory.get(message.author.id) || [
        { role: "system", content: SYSTEM_INSTRUCTION }
    ];

    const userMessage = { role: "user", content: message.content || (images.length > 0 ? "ط­ظ„ظ„ ظ‡ط°ظ‡ ط§ظ„طµظˆط±ط©" : "") };
    if (images.length > 0) {
        userMessage.images = images;
    }
    history.push(userMessage);

    if (history.length > 11) history.splice(1, history.length - 11);

    try {
        const response = await axios.post(AI_API_URL, {
            model: AI_MODEL,
            messages: history,
            stream: false
        }, {
            headers: {
                'Authorization': `Bearer ${AI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 90000 
        });

        const aiReply = response.data.message.content;
        history.push({ role: "assistant", content: aiReply });
        conversationHistory.set(message.author.id, history);

        await message.reply(aiReply);
    } catch (error) {
        console.error('â‌Œ AI Chat API Error:', error.response ? error.response.data : error.message);
        await message.reply("ظ…ط¹ظ„ظٹط´ ظٹط§ ظˆط­ط´طŒ ط§ظ„ظ†ط¸ط§ظ… ظˆط§ط¬ظ‡ ظ…ط´ظƒظ„ط© ظ„ط­ط¸ظٹط©طŒ ظٹط±ط¬ظ‰ ط§ظ„ظ…ط­ط§ظˆظ„ط© ط¨ط¹ط¯ ظ‚ظ„ظٹظ„. âڑ™ï¸ڈ");
    }
});

console.log('ًں”„ Attempting Discord login...');

// ==========================================
// ====== AI Chatbot Logic (Gemma4:31b) =====
// ==========================================
const AI_MODEL = 'gemma4:31b';
const AI_API_KEY = process.env.AI_API_KEY || 'a20429c9b229429ebb6807f3950676b7.ypGQv33qB02UX8CYqciG_Lmv';
const AI_API_URL = process.env.AI_API_URL || 'https://ollama.com/api/chat';
const AI_CHANNEL_ID = '1494851523010625562';
const conversationHistory = new Map();

const SYSTEM_INSTRUCTION = `أنت "بوت T3N". خوينا السعودي الذكي في ديسكورد متجر "T3N TEAM".
وظيفتك: خدمة عملاء ودعم فني لمنتجات السبوفر (Spoofer) + التحقق من الفواتير.
شخصيتك: لهجة سعودية قوية: "يا وحش"، "ابشر"، "لا تشيل هم". ردودك مختصرة.
المنتجات (احفظها صم):
1. سبوفر فورتنايت (49.99 ريال): يفك باند فورتنايت نهائياً.
2. سبوفر بيرم ألعاب (35 ريال): يفك باند جميع الألعاب ما عدا فورتنايت.
3. خدمة VIP (200 ريال): مفتاح خاص مدى الحياة لجميع الألعاب (ومعها فورتنايت).
4. طلب خاص / دعم فني (35 ريال): الفريق يسوي لك السبوفر.
القوانين: الدفع قبل التسليم. التقييم بعد الخدمة لتفعيل الضمان.
تحليل الصور: إذا أرسل العميل صورة، افحصها. إذا فاتورة ادفع أو حوالة بنكية بارك له. إذا شهادة شكر ارفضها باحترام.`

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== AI_CHANNEL_ID) return;
    await message.channel.sendTyping();
    let images = [];
    if (message.attachments.size > 0) {
        for (const attachment of message.attachments.values()) {
            if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                try {
                    const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                    images.push(Buffer.from(response.data, 'binary').toString('base64'));
                } catch (err) {}
            }
        }
    }
    let history = conversationHistory.get(message.author.id) || [{ role: "system", content: SYSTEM_INSTRUCTION }];
    const userMessage = { role: "user", content: message.content || (images.length > 0 ? "حلل هذه الصورة" : "") };
    if (images.length > 0) userMessage.images = images;
    history.push(userMessage);
    if (history.length > 11) history.splice(1, history.length - 11);
    try {
        const response = await axios.post(AI_API_URL, { model: AI_MODEL, messages: history, stream: false }, { headers: { 'Authorization': "Bearer " + AI_API_KEY, 'Content-Type': 'application/json' }, timeout: 90000 });
        const aiReply = response.data.message.content;
        history.push({ role: "assistant", content: aiReply });
        conversationHistory.set(message.author.id, history);
        await message.reply(aiReply);
    } catch (error) {}
});
client.login(DISCORD_TOKEN).catch(err => {
  console.error('â‌Œ FATAL: Discord login failed:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('â‌Œ Unhandled Rejection:', err);
});
