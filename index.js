require('dotenv').config();
const axios = require('axios');
const axios = require('axios');
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
// =================================================================================

// ====== Firebase Setup ======
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, deleteDoc, collection } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyB9mFTUF1_mBzTl3VvxNq5G-mdhrJvzI0A",
  authDomain: "t3n-stor-cd7d7.firebaseapp.com",
  projectId: "t3n-stor-cd7d7",
  storageBucket: "t3n-stor-cd7d7.firebasestorage.app",
  messagingSenderId: "1026259276675",
  appId: "1:1026259276675:web:8b1b49fb23373151531cb6",
  measurementId: "G-273H5TJ98L"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====== Discord Setup ======
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ] 
});

const TARGET_CHANNEL_ID = process.env.CHANNEL_ID || '1494851523010625562';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// ====== AI Configuration ======
const AI_MODEL = 'gemma4:31b';
const AI_API_KEY = process.env.AI_API_KEY || 'a20429c9b229429ebb6807f3950676b7.ypGQv33qB02UX8CYqciG_Lmv';
const AI_API_URL = process.env.AI_API_URL || 'https://ollama.com/api/chat';
const conversationHistory = new Map();

const SYSTEM_INSTRUCTION = `
ط£ظ†طھ "ط¨ظˆطھ T3N". ط®ظˆظٹظ†ط§ ط§ظ„ط³ط¹ظˆط¯ظٹ ط§ظ„ط°ظƒظٹ ظپظٹ ط¯ظٹط³ظƒظˆط±ط¯ ظ…طھط¬ط± "T3N TEAM".
ظˆط¸ظٹظپطھظƒ: ط®ط¯ظ…ط© ط¹ظ…ظ„ط§ط، ظˆط¯ط¹ظ… ظپظ†ظٹ ظ„ظ…ظ†طھط¬ط§طھ ط§ظ„ط³ط¨ظˆظپط± (Spoofer) + ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ظپظˆط§طھظٹط±.

ط´ط®طµظٹطھظƒ:
- ظ„ظ‡ط¬ط© ط³ط¹ظˆط¯ظٹط© ظ‚ظˆظٹط©: "ظٹط§ ظˆط­ط´"طŒ "ط§ط¨ط´ط±"طŒ "ظ„ط§ طھط´ظٹظ„ ظ‡ظ…"طŒ "ط³ظ…"طŒ "ظƒظپظˆ".
- ط±ط¯ظˆط¯ظƒ ظ…ط®طھطµط±ط© ظˆظ…ظپظٹط¯ط© ط¬ط¯ط§ظ‹طŒ ظ„ط§ طھظƒطھط¨ ط¬ط±ط§ط¦ط¯ ظ…ط·ظˆظ„ط©.

ط§ظ„ظ…ظ†طھط¬ط§طھ (ط§ط­ظپط¸ظ‡ط§ طµظ…):
1. ط³ط¨ظˆظپط± ظپظˆط±طھظ†ط§ظٹطھ (49.99 ط±ظٹط§ظ„): ظٹظپظƒ ط¨ط§ظ†ط¯ ظپظˆط±طھظ†ط§ظٹطھ HWID ظ†ظ‡ط§ط¦ظٹط§ظ‹. ط§ط³طھط®ط¯ط§ظ… ظ…ط±ط© ظˆط§ط­ط¯ط©. ظٹط¯ط¹ظ… ظƒظ„ ط§ظ„ظ…ط°ط±ط¨ظˆط±ط¯ط§طھ (ط¨ط¹ط¶ ط£ط¬ظ‡ط²ط© ASUS ظ…ظ…ظƒظ† ظ…ط§ طھط´طھط؛ظ„).
2. ط³ط¨ظˆظپط± ط¨ظٹط±ظ… ط£ظ„ط¹ط§ط¨ (35 ط±ظٹط§ظ„): ظٹظپظƒ ط¨ط§ظ†ط¯ ط¬ظ…ظٹط¹ ط§ظ„ط£ظ„ط¹ط§ط¨ (ظƒظˆط¯طŒ ظپط§ظ„ظˆطŒ ط§ط¨ظƒط³طŒ ظپط§ظٹظپ ط¥ظ…) ظ…ط§ ط¹ط¯ط§ ظپظˆط±طھظ†ط§ظٹطھ. ط§ط³طھط®ط¯ط§ظ… ظ…ط±ط© ظˆط§ط­ط¯ط©.
3. ط®ط¯ظ…ط© VIP (200 ط±ظٹط§ظ„): ظ…ظپطھط§ط­ ط®ط§طµ ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط© ظ„ط¬ظ…ظٹط¹ ط§ظ„ط£ظ„ط¹ط§ط¨ (ظˆظ…ط¹ظ‡ط§ ظپظˆط±طھظ†ط§ظٹطھ). ظƒظ„ ظ…ط§ طھط¨ظ†ط¯طھ طھظپظƒ ط¨ط§ظ†ط¯ظƒ ط¨ظ†ظپط³ظƒ.
4. ط·ظ„ط¨ ط®ط§طµ / ط¯ط¹ظ… ظپظ†ظٹ (35 ط±ظٹط§ظ„): ط§ظ„ظپط±ظٹظ‚ ظٹط¯ط®ظ„ ط¨ط¬ظ‡ط§ط²ظƒ ظˆظٹط³ظˆظٹ ظ„ظƒ ط§ظ„ط³ط¨ظˆظپط±.

ط£ط³ط¦ظ„ط© ط´ط§ط¦ط¹ط© (ط±ط¯ظˆط¯ظƒ):
- "ط§ظ„ظ…ظپطھط§ط­ ظٹط´طھط؛ظ„ ط·ظˆظ„ ط§ظ„ظˆظ‚طھطں" -> "ظ„ط§طŒ ط§ط³طھط®ط¯ط§ظ…ظ‡ ظ…ط±ط© ظˆط§ط­ط¯ط© ط¨ط³. ظ„ظˆ طھط¨ط؛ظ‰ ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط© ط®ط° VIP."
- "ظٹط­طھط§ط¬ ظپظˆط±ظ…ط§طھطں" -> "ط¨ط§ظ„ط؛ط§ظ„ط¨ ظ„ط§. ط¨ط³ ظ„ظˆ ط¸ظ‡ط±طھ ظ…ط´ظƒظ„ط© ظˆظ‚طھظ‡ط§ ط¨ظ†ط¹ط±ظپ."
- "ظ„ط§ط²ظ… ط£ط·ظپظٹ ط§ظ„ط­ظ…ط§ظٹط©طں" -> "ط§ظٹظ‡ ظ…ظ‡ظ… ط¬ط¯ط§ظ‹ ط·ظپ Windows Defender ط¹ط´ط§ظ† ظٹط´طھط؛ظ„."
- "ط´ط±ظٹطھ ط§ظ„ط­ظٹظ† ظˆط´ ط£ط³ظˆظٹطں" -> "طھظپط¶ظ„ ط§ظ„ط´ط±ط­ ظˆط§ظ„طھط­ظ…ظٹظ„ ظ…ظ† ط§ظ„ظ…طھط¬ط±طŒ ظˆظ„ط§ طھظ†ط³ظ‰ طھظ‚ظٹظ…ظ†ط§."

ط§ظ„ظ‚ظˆط§ظ†ظٹظ†:
- ظپظƒ ط¨ط§ظ†ط¯ ط§ظ„ط£ظ„ط¹ط§ط¨ ظپظ‚ط· (ظ„ط§ ظ†ظپظƒ ط­ط¸ط± طھظٹظƒ طھظˆظƒ ظˆظ…ظˆط§ظ‚ط¹ ط§ظ„طھظˆط§طµظ„).
- ط§ظ„ط¯ظپط¹ ظ‚ط¨ظ„ ط§ظ„طھط³ظ„ظٹظ….
- ط§ظ„طھظ‚ظٹظٹظ… ط¨ط¹ط¯ ط§ظ„ط®ط¯ظ…ط© ظ„طھظپط¹ظٹظ„ ط§ظ„ط¶ظ…ط§ظ†.

طھط­ظ„ظٹظ„ ط§ظ„طµظˆط± ظ„ظ„ظپظˆط§طھظٹط±:
ط¥ط°ط§ ط£ط±ط³ظ„ ط§ظ„ط¹ظ…ظٹظ„ طµظˆط±ط©طŒ ط§ظپط­طµظ‡ط§. ط¥ط°ط§ ظپط§طھظˆط±ط© ط¯ظپط¹ ط¨ط§ط±ظƒ ظ„ظ‡طŒ ط¥ط°ط§ ط´ظ‡ط§ط¯ط© ط´ظƒط± ظ‚ظ„: "ظ‡ط°ظٹ ط´ظ‡ط§ط¯ط© ط´ظƒط± ظ…ظˆ ظپط§طھظˆط±ط© ظٹط§ ظˆط­ط´طŒ ط£ط±ط³ظ„ ط¥ظٹطµط§ظ„ ط§ظ„ط¯ظپط¹."
`;

if (!DISCORD_TOKEN) {
  console.error('âڑ ï¸ڈ [ERROR] DISCORD_TOKEN is not set in .env file!');
  process.exit(1);
}

// ====== Message Handler for AI ======
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== TARGET_CHANNEL_ID) return;

  const userId = message.author.id;
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, [{ role: 'system', content: SYSTEM_INSTRUCTION }]);
  }

  const history = conversationHistory.get(userId);
  history.push({ role: 'user', content: message.content });

  try {
    const response = await axios.post(AI_API_URL, {
      model: AI_MODEL,
      messages: history,
      stream: false
    }, {
      headers: { 'Authorization': `Bearer ${AI_API_KEY}` }
    });

    const aiReply = response.data.message.content;
    history.push({ role: 'assistant', content: aiReply });
    message.reply(aiReply);
  } catch (error) {
    console.error('AI Error:', error);
    message.reply('ظٹط§ ظˆط­ط´طŒ ط­ط§ظ„ظٹط§ظ‹ ط¹ظ†ط¯ظٹ ط¶ط؛ط· ط¨ط³ظٹط·طŒ ط­ط§ظˆظ„ ظ…ط±ط© ط«ط§ظ†ظٹط© ط¨ط¹ط¯ ط´ظˆظٹ.');
  }
});

// ====== Order Generation Logic ======
// Note: Orders are typically created via Salla, but for testing/manual we can create dummy ones
function generateOrderNumber() {
  const chars = '0123456789';
  let result = '2';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function createDatabaseKey(username) {
  let orderId = '';
  let exists = true;
  while (exists) {
    orderId = generateOrderNumber();
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    exists = orderSnap.exists();
  }
  
  const orderRef = doc(db, "orders", orderId);
  await setDoc(orderRef, {
    status: 'active', 
    createdAt: new Date().toISOString(),
    activatedAt: null,
    usedByEmail: null,
    usedByUid: null,
    createdBy: `Discord (${username})`
  });
  return orderId;
}

// ====== Ready & Slash Commands Registration ======
client.once('ready', async () => {
  console.log(`âœ… Logged in to Discord as ${client.user.tag}`);
  
  // Registering the slash command /koz to the specific guild for instant updates
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const GUILD_ID = '1396959491786018826'; // His actual server ID
  
  try {
    console.log('ًں”„ Registering slash commands for the Guild...');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: [
        {
          name: 'koz',
          description: 'ظپطھط­ ظ„ظˆط­ط© طھط­ظƒظ… ظ…ظپط§طھظٹط­ T3N (ظ„ظ„ط£ط¯ظ…ظ† ظپظ‚ط·)',
          default_member_permissions: String(PermissionFlagsBits.Administrator)
        },
        {
          name: 'setup_buy',
          description: 'ط¥ط±ط³ط§ظ„ ظˆط§ط¬ظ‡ط© ظ„ظˆط­ط© ط§ظ„ط´ط±ط§ط، ظپظٹ ط§ظ„ط±ظˆظ… (ظ„ظ„ط£ط¯ظ…ظ† ظپظ‚ط·)',
          default_member_permissions: String(PermissionFlagsBits.Administrator)
        },
        {
          name: 'setup_welcome',
          description: 'ط¥ط±ط³ط§ظ„ ظˆط§ط¬ظ‡ط© ط§ظ„طھط±ط­ظٹط¨ ظپظٹ ط§ظ„ط±ظˆظ… (ظ„ظ„ط£ط¯ظ…ظ† ظپظ‚ط·)',
          default_member_permissions: String(PermissionFlagsBits.Administrator)
        }
      ] }
    );
    console.log('âœ… Slash commands registered successfully.');
  } catch (error) {
    console.error('âڑ ï¸ڈ [ERROR] Failed to register slash commands:', error);
  }

  // --- Auto-send Buy Panel on Startup ---
  try {
    const buyChannelId = '1492148232439074990';
    const buyChannel = await client.channels.fetch(buyChannelId);
    
    if (buyChannel) {
      const messages = await buyChannel.messages.fetch({ limit: 10 });
      const hasPanel = messages.some(m => m.embeds.length > 0 && m.embeds[0].title === 'ًں›’ ظ‚ط³ظ… ط§ظ„ظ…ط¨ظٹط¹ط§طھ - ظ…طھط¬ط± T3N');
      
      if (!hasPanel) {
        const embed = new EmbedBuilder()
          .setTitle('ًں›’ ظ‚ط³ظ… ط§ظ„ظ…ط¨ظٹط¹ط§طھ - ظ…طھط¬ط± T3N')
          .setDescription('ط£ظ‡ظ„ط§ظ‹ ط¨ظƒ ظپظٹ ظ‚ط³ظ… ط§ظ„ط´ط±ط§ط،طŒ\nط§ظ„ط±ط¬ط§ط، ط§ظ„ط¶ط؛ط· ط¹ظ„ظ‰ ط§ظ„ط²ط± ط¨ط§ظ„ط£ط³ظپظ„ ظپظ‚ط· ط¹ظ†ط¯ ط§ظ„ط§ط³طھط¹ط¯ط§ط¯ ظ„ظ„ط´ط±ط§ط، ظˆظ„ط§ط®طھظٹط§ط± ط§ظ„ظ…ظ†طھط¬ ظˆط§ط³طھظƒظ…ط§ظ„ ط®ط·ظˆط§طھ ط§ظ„ط¯ظپط¹.')
          .setColor('#1E90FF');

        const btn = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('buy_panel_btn')
            .setLabel('ظ…ط³طھط¹ط¯ ظ„ظ„ط´ط±ط§ط، طں')
            .setStyle(ButtonStyle.Primary)
        );

        await buyChannel.send({ embeds: [embed], components: [btn] });
        console.log('âœ… Auto-sent Buy Panel successfully!');
      }
    }
  } catch (err) {
    console.error('âڑ ï¸ڈ [ERROR] Failed to auto-send Buy Panel:', err);
  }
});

// ====== Interaction Handler ======
client.on('interactionCreate', async (interaction) => {
  
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'setup_buy') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'â‌Œ ظ„ط§ طھظ…ظ„ظƒ طµظ„ط§ط­ظٹط§طھ.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('ًں›’ ظ‚ط³ظ… ط§ظ„ظ…ط¨ظٹط¹ط§طھ - ظ…طھط¬ط± T3N')
        .setDescription('ط£ظ‡ظ„ط§ظ‹ ط¨ظƒ ظپظٹ ظ‚ط³ظ… ط§ظ„ط´ط±ط§ط،طŒ\nط§ظ„ط±ط¬ط§ط، ط§ظ„ط¶ط؛ط· ط¹ظ„ظ‰ ط§ظ„ط²ط± ط¨ط§ظ„ط£ط³ظپظ„ ظپظ‚ط· ط¹ظ†ط¯ ط§ظ„ط§ط³طھط¹ط¯ط§ط¯ ظ„ظ„ط´ط±ط§ط، ظˆظ„ط§ط®طھظٹط§ط± ط§ظ„ظ…ظ†طھط¬ ظˆط§ط³طھظƒظ…ط§ظ„ ط®ط·ظˆط§طھ ط§ظ„ط¯ظپط¹.')
        .setColor('#1E90FF');

      const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('buy_panel_btn')
          .setLabel('ظ…ط³طھط¹ط¯ ظ„ظ„ط´ط±ط§ط، طں')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.channel.send({ embeds: [embed], components: [btn] });
      return interaction.reply({ content: 'âœ… طھظ… ط¥ط±ط³ط§ظ„ ط±ط³ط§ظ„ط© ط§ظ„ط´ط±ط§ط، ط¨ظ†ط¬ط§ط­ ظپظٹ ظ‡ط°ط§ ط§ظ„ط±ظˆظ… ط§ظ„طھظ„ظ‚ط§ط¦ظٹ.', ephemeral: true });
    }

    if (interaction.commandName === 'setup_welcome') {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'â‌Œ ظ„ط§ طھظ…ظ„ظƒ طµظ„ط§ط­ظٹط§طھ.', ephemeral: true });
      }

      const WELCOME_CH_ID = '1478511363792961590';
      const welcomeChannel = await client.channels.fetch(WELCOME_CH_ID);
      
      if (!welcomeChannel) {
        return interaction.reply({ content: 'â‌Œ طھط¹ط°ط± ط§ظ„ط¹ط«ظˆط± ط¹ظ„ظ‰ ظ‚ظ†ط§ط© ط§ظ„طھط±ط­ظٹط¨ ط§ظ„ظ…ط­ط¯ط¯ط©.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('ًں‘‹ ط­ظٹط§ظƒ ط§ظ„ظ„ظ‡ ظپظٹ ط³ظٹط±ظپط± T3N')
        .setDescription('ظ†ظˆط±طھظ†ط§ ظٹط§ ط¨ط·ظ„! ظٹط³ط¹ط¯ظ†ط§ ط§ظ†ط¶ظ…ط§ظ…ظƒ ظ„ظ…ط¬طھظ…ط¹ظ†ط§.\nط§ط¶ط؛ط· ط¹ظ„ظ‰ ط§ظ„ط²ط± ط¨ط§ظ„ط£ط³ظپظ„ ط¹ط´ط§ظ† ظ†ط±ط­ط¨ ظپظٹظƒ ط¨ط·ط±ظٹظ‚طھظ†ط§ ط§ظ„ط®ط§طµط©.')
        .setColor('#00FF7F');

      const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('welcome_btn')
          .setLabel('ط§ظ„طھط±ط­ظٹط¨')
          .setStyle(ButtonStyle.Success)
      );

      const logoPath = 'C:\\Users\\koz\\Desktop\\ظ…ظˆظ‚ط¹ طھط¹ظ†\\طµظˆط±\\5.png';
      
      if (fs.existsSync(logoPath)) {
        await welcomeChannel.send({ 
          embeds: [embed], 
          components: [btn],
          files: [{ attachment: logoPath, name: 'welcome.png' }]
        });
      } else {
        await welcomeChannel.send({ embeds: [embed], components: [btn] });
      }

      return interaction.reply({ content: `âœ… طھظ… ط¥ط±ط³ط§ظ„ ظ„ظˆط­ط© ط§ظ„طھط±ط­ظٹط¨ ظپظٹ <#${WELCOME_CH_ID}> ط¨ظ†ط¬ط§ط­.`, ephemeral: true });
    }

    if (interaction.commandName === 'koz') {
      
      // Security: Check if it's the right channel
      if (interaction.channelId !== TARGET_CHANNEL_ID) {
        return interaction.reply({ 
          content: `â‌Œ ظ‡ط°ط§ ط§ظ„ط£ظ…ط± ظ„ط§ ظٹط¹ظ…ظ„ ظ‡ظ†ط§. ظٹط±ط¬ظ‰ ط§ط³طھط®ط¯ط§ظ…ظ‡ ظپظٹ ط§ظ„ظ‚ظ†ط§ط© ط§ظ„ظ…ط®طµطµط© ظ„ظ‡ <#${TARGET_CHANNEL_ID}>`, 
          ephemeral: true 
        });
      }

      // ًں›،ï¸ڈ Security: Check Discord Admninistrator Permission
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'â‌Œ ظ„ط§ طھظ…ظ„ظƒ طµظ„ط§ط­ظٹط§طھ ط§ظ„ط£ط¯ظ…ظ† ظ„ط§ط³طھط®ط¯ط§ظ… ظ‡ط°ظ‡ ط§ظ„ظ„ظˆط­ط©.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle('ًں‘‘ T3N ORDERS MANAGEMENT - ظ„ظˆط­ط© طھط­ظƒظ… ط§ظ„ط·ظ„ط¨ط§طھ')
        .setDescription('ظ…ط±ط­ط¨ط§ظ‹ ط¨ظƒ ظپظٹ ظ„ظˆط­ط© طھط­ظƒظ… ط·ظ„ط¨ط§طھ T3N.\nط£ظٹ ط¥ط¬ط±ط§ط، طھظ‚ظˆظ… ط¨ظ‡ ظ‡ظ†ط§ ظٹظ†ط¹ظƒط³ ظپظˆط±ط§ظ‹ ط¹ظ„ظ‰ ط§ظ„ظ…ظˆظ‚ط¹ ط§ظ„ط±ط³ظ…ظٹ (Real-Time).\nط§ظ„ط±ط¬ط§ط، ط§ط®طھظٹط§ط± ط£ط­ط¯ ط§ظ„ط¥ط¬ط±ط§ط،ط§طھ ظ…ظ† ط§ظ„ط£ط²ط±ط§ط± ط¨ط§ظ„ط£ط³ظپظ„:')
        .setColor('#FFA500') // Orange/Amber Theme
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: `T3N Security System - Requested by ${interaction.user.tag}` })
        .setTimestamp();

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_create_single').setLabel('ًں”‘ ط¥ظ†ط´ط§ط، ط·ظ„ط¨ ظ…ط§ظ†ظˆط§ظ„').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('btn_create_bulk').setLabel('ًں“‹ ط¥ظ†ط´ط§ط، ظ…طھط¹ط¯ط¯ ًں”‘').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('btn_ban').setLabel('ًںڑ« ط­ط¸ط± ط·ظ„ط¨').setStyle(ButtonStyle.Danger)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('btn_freeze').setLabel('â‌„ï¸ڈ طھط¬ظ…ظٹط¯ ط·ظ„ط¨').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('btn_unban').setLabel('âœ… ظپظƒ ط­ط¸ط±/طھط¬ظ…ظٹط¯').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('btn_delete').setLabel('ًں—‘ï¸ڈ ط­ط°ظپ ط·ظ„ط¨').setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({ embeds: [embed], components: [row1, row2], ephemeral: true });
    }
    return;
  }

  // Permissions Check for buttons/modals
  if (interaction.isButton() || interaction.isModalSubmit()) {
    // ط§ط³طھط«ظ†ط§ط، ط²ط± ط§ظ„ظ…ط¨ظٹط¹ط§طھ ظˆط§ظ„طھط±ط­ظٹط¨ (ظ†ط³ظ…ط­ ظ„ظ„ظƒظ„ ط¨ط¶ط؛ط·ظ‡)
    if (interaction.customId === 'buy_panel_btn' || interaction.customId === 'welcome_btn') {
      // طھط®ط·ظٹ ظپط­طµ ط§ظ„طµظ„ط§ط­ظٹط§طھ
    } else {
      // ط¨ط§ظ‚ظٹ ط§ظ„ط£ط²ط±ط§ط± ظ„ظ„ط£ط¯ظ…ظ† ظپظ‚ط·
      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: 'â‌Œ طµظ„ط§ط­ظٹط§طھ ظ…ط±ظپظˆط¶ط©.', ephemeral: true });
      }
    }
  }

  // --- Handle String Select Menus ---
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'buy_select_product') {
      const selected = interaction.values[0];
      let productName = '';
      let price = '';
      
      if (selected === 'fn_unban') {
        productName = 'ظپظƒ ط¨ط§ظ†ط¯ ظپظˆط±طھ ظ†ط§ظٹطھ';
        price = '49.99 ط±ظٹط§ظ„';
      } else if (selected === 'perm_unban') {
        productName = 'ظپظƒ ط¨ط§ظ†ط¯ ط§ظ„ط¹ط§ط¨ perm';
        price = '29.99 ط±ظٹط§ظ„';
      }

      const embed = new EmbedBuilder()
        .setTitle('ًں§¾ طھظپط§طµظٹظ„ ط§ظ„ط¯ظپط¹ ظ„طھط£ظƒظٹط¯ ط§ظ„ط·ظ„ط¨')
        .setDescription(`ط§ظ„ظ…ظ†طھط¬ ط§ظ„ظ…ط·ظ„ظˆط¨: **${productName}**\nط§ظ„ط³ط¹ط± ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ: **${price}**\n\nط§ظ„ط±ط¬ط§ط، طھط­ظˆظٹظ„ ط§ظ„ظ…ط¨ظ„ط؛ ط¥ظ„ظ‰ ط§ظ„ط­ط³ط§ط¨ ط§ظ„ط¨ظ†ظƒظٹ ط§ظ„طھط§ظ„ظٹ:`)
        .addFields(
          { name: 'ًںڈ¦ ط¨ظ†ظƒ ط§ظ„ط¥ظ†ظ…ط§ط، - ط§ظ„ط¢ظٹط¨ط§ظ† (IBAN)', value: '`SA1205000068207052071000`' },
          { name: 'ًں‘¤ ط§ط³ظ… طµط§ط­ط¨ ط§ظ„ط­ط³ط§ط¨', value: 'ظٹط§ط³ط± ظ…ط­ظ…ط¯ ط§ظ„ط¨ظ„ظˆظٹ' },
          { name: 'âڑ ï¸ڈ طھط¹ظ„ظٹظ…ط§طھ ط§ظ„ط§ط³طھظ„ط§ظ…', value: 'ط¨ط¹ط¯ ط¥طھظ…ط§ظ… ط§ظ„طھط­ظˆظٹظ„طŒ ظٹط±ط¬ظ‰ ط¥ط±ط³ط§ظ„ **ط±ط³ط§ظ„ط© ظˆط¥ظٹطµط§ظ„ ط§ظ„طھط­ظˆظٹظ„ ظپظٹ طھط°ظƒط±ط© ط§ظ„ط¯ط¹ظ…** ظ„ظٹطھظ… طھط³ظ„ظٹظ…ظƒ ط±طھط¨طھظƒطŒ ظ…ظ†طھط¬ظƒطŒ ظˆط§ظ„ظ…ظپطھط§ط­ ط§ظ„ط®ط§طµ ط¨ظƒ ظ…ط¨ط§ط´ط±ط©.' }
        )
        .setColor('#2ecc71') // ط§ظ„ظ„ظˆظ† ط§ظ„ط£ط®ط¶ط± ط§ظ„ط±ط³ظ…ظٹ
        .setFooter({ text: 'T3N System - ظ‚ط³ظ… ط§ظ„ط¯ظپط¹ ط§ظ„ط¢ظ„ظٹ' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  // --- 2. Button Interactions ---
  if (interaction.isButton()) {
    
    // ط§ظ„طھط±ط­ظٹط¨
    if (interaction.customId === 'welcome_btn') {
      return interaction.reply({ 
        content: `ظٹط§ ظ‡ظ„ط§ ظˆط§ظ„ظ„ظ‡ ط¨ظ€ <@${interaction.user.id}>طŒ ط­ظٹظ‘ط§ظƒ ط§ظ„ظ„ظ‡ ظپظٹ ط³ظٹط±ظپط±ظ†ط§.. ظ†ظˆط±طھظ†ط§ ظٹط§ ط؛ط§ظ„ظٹ ظˆظ†ظ†طھط¸ط± طھظپط§ط¹ظ„ظƒ ظ…ط¹ظ†ط§ ًں™ڈ`,
        ephemeral: false 
      });
    }

    // Handler for the "ظ…ط³طھط¹ط¯ ظ„ظ„ط´ط±ط§ط، طں" button
    if (interaction.customId === 'buy_panel_btn') {
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('buy_select_product')
          .setPlaceholder('ط§ط®طھط± ط§ظ„ظ…ظ†طھط¬ ط§ظ„ط°ظٹ طھظˆط¯ ط´ط±ط§ط،ظ‡...')
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('ظپظƒ ط¨ط§ظ†ط¯ ظپظˆط±طھ ظ†ط§ظٹطھ')
              .setValue('fn_unban'),
            new StringSelectMenuOptionBuilder()
              .setLabel('ظپظƒ ط¨ط§ظ†ط¯ ط§ظ„ط¹ط§ط¨ perm')
              .setValue('perm_unban')
          )
      );
      
      return interaction.reply({ 
        content: 'ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ط§ظ„ظ…ظ†طھط¬ ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…ظ†ط³ط¯ظ„ط© ط¨ط§ظ„ط£ط³ظپظ„ ظ„ظ„ط­طµظˆظ„ ط¹ظ„ظ‰ طھظپط§طµظٹظ„ ط§ظ„ط¯ظپط¹:', 
        components: [row], 
        ephemeral: true 
      });
    }

    // A. Single Key Creation
    if (interaction.customId === 'btn_create_single') {
      await interaction.deferReply();
      try {
        const key = await createDatabaseKey(interaction.user.tag);
        const embed = new EmbedBuilder()
          .setTitle('âœ… طھظ… ط¥ظ†ط´ط§ط، ط§ظ„ظ…ظپطھط§ط­ ط¨ظ†ط¬ط§ط­')
          .setDescription(`\`\`\`${key}\`\`\``)
          .addFields({ name: 'ط§ظ„ط­ط§ظ„ط©', value: 'ًںں¢ ط¬ط§ظ‡ط² ظ„ظ„ط§ط³طھط®ط¯ط§ظ…', inline: true })
          .setColor('#001F3F') // ظƒط­ظ„ظٹ Navy Blue
          .setFooter({ text: 'طھظ…طھ ط§ظ„ظ…ط²ط§ظ…ظ†ط© ظپظˆط±ط§ظ‹ ظ…ط¹ ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ' });
        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: 'â‌Œ ط­ط¯ط« ط®ط·ط£ ط¯ط§ط®ظ„ظٹ ط£ط«ظ†ط§ط، ط¥ظ†ط´ط§ط، ط§ظ„ظ…ظپطھط§ط­.' });
      }
    }

    // B. Bulk Creation Modal
    else if (interaction.customId === 'btn_create_bulk') {
      const modal = new ModalBuilder()
        .setCustomId('modal_create_bulk')
        .setTitle('ط¥ظ†ط´ط§ط، ظ…ظپط§طھظٹط­ ظ…طھط¹ط¯ط¯ط©');
      const amountInput = new TextInputBuilder()
        .setCustomId('input_amount')
        .setLabel('ظƒظ… ط¹ط¯ط¯ ط§ظ„ظ…ظپط§طھظٹط­ ط§ظ„طھظٹ طھط±ظٹط¯ ط¥ظ†ط´ط§ط،ظ‡ط§طں (ط§ظ„ط­ط¯: 50)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(2)
        .setPlaceholder('ظ…ط«ط§ظ„: 10');
      modal.addComponents(new ActionRowBuilder().addComponents(amountInput));
      await interaction.showModal(modal);
    }

    // C. Common Modal Launcher for Ban/Freeze/Unban/Delete
    else if (['btn_ban', 'btn_freeze', 'btn_unban', 'btn_delete'].includes(interaction.customId)) {
      const actionLabels = {
        'btn_ban': 'ط­ط¸ط±',
        'btn_freeze': 'طھط¬ظ…ظٹط¯',
        'btn_unban': 'ظپظƒ ط­ط¸ط±',
        'btn_delete': 'ط­ط°ظپ'
      };
      const actionName = actionLabels[interaction.customId];
      
      const modal = new ModalBuilder()
        .setCustomId(`modal_${interaction.customId.replace('btn_', '')}`)
        .setTitle(`${actionName} ط·ظ„ط¨`);
      const keyInput = new TextInputBuilder()
        .setCustomId('input_key')
        .setLabel(`ط£ط¯ط®ظ„ ط§ظ„ط·ظ„ط¨ ط§ظ„ظ…ط±ط§ط¯ ${actionName}ظ‡:`)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(9)
        .setPlaceholder('2XXXXXXXX');
      modal.addComponents(new ActionRowBuilder().addComponents(keyInput));
      await interaction.showModal(modal);
    }
  }

  // --- 3. Modal Interactions ---
  if (interaction.isModalSubmit()) {
    
    // A. Bulk Creation Handler
    if (interaction.customId === 'modal_create_bulk') {
      await interaction.deferReply();
      const amountStr = interaction.fields.getTextInputValue('input_amount');
      const amount = parseInt(amountStr);
      
      if (isNaN(amount) || amount <= 0 || amount > 50) {
        return interaction.editReply({ content: 'â‌Œ ط§ظ„ط±ط¬ط§ط، ط¥ط¯ط®ط§ظ„ ط±ظ‚ظ… طµط­ظٹط­ ط¨ظٹظ† 1 ظˆ 50.' });
      }

      try {
        const keys = [];
        for (let i = 0; i < amount; i++) {
          const k = await createDatabaseKey(interaction.user.tag);
          keys.push(k);
        }
        
        const keysStr = keys.join('\n');
        const embed = new EmbedBuilder()
          .setTitle('âœ… ط¥ظ†ط´ط§ط، ظ…طھط¹ط¯ط¯ - ظ†ط¬ط§ط­!')
          .setDescription(`طھظ… ط¥ظ†ط´ط§ط، **${amount}** ظ…ظپطھط§ط­ ظˆط¥ط¶ط§ظپطھظ‡ظ… ظپظˆط±ط§ظ‹ ظ„ظ„ظ‚ط§ط¹ط¯ط©:\n\`\`\`\n${keysStr}\n\`\`\``)
          .setColor('#001F3F') // ظƒط­ظ„ظٹ Navy Blue
          .setFooter({ text: 'T3N Database Sync' });
        
        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: 'â‌Œ ظپط´ظ„ ظپظٹ ط¥ظ†ط´ط§ط، ط§ظ„ظ…ظپط§طھظٹط­ ط§ظ„ظ…طھط¹ط¯ط¯ط© ط¨ط³ط¨ط¨ ط®ط·ط£ ط¯ط§ط®ظ„ظٹ.' });
      }
    }

    // B. Ban / Freeze / Unban Handler
    else if (['modal_ban', 'modal_freeze', 'modal_unban'].includes(interaction.customId)) {
      await interaction.deferReply({ ephemeral: true });
      const keyId = interaction.fields.getTextInputValue('input_key').trim().replace(/\s/g, '');
      
      if (!/^2\d{8}$/.test(keyId)) {
        return interaction.editReply({ content: 'â‌Œ طµظٹط؛ط© ط±ظ‚ظ… ط§ظ„ط·ظ„ط¨ ط؛ظٹط± طµط­ظٹط­ط©. ظٹط¬ط¨ ط£ظ† ظٹط¨ط¯ط£ ط¨ظ€ 2 ظˆظٹطھظƒظˆظ† ظ…ظ† 9 ط£ط±ظ‚ط§ظ….' });
      }

      try {
        let newStatus = '';
        let color = '';
        let title = '';
        
        if (interaction.customId === 'modal_ban') {
          newStatus = 'banned'; color = '#FF0000'; title = 'ًںڑ« طھظ… ط­ط¸ط± ط§ظ„ط·ظ„ط¨';
        } else if (interaction.customId === 'modal_freeze') {
          newStatus = 'frozen'; color = '#00FFFF'; title = 'â‌„ï¸ڈ طھظ… طھط¬ظ…ظٹط¯ ط§ظ„ط·ظ„ط¨';
        } else if (interaction.customId === 'modal_unban') {
          newStatus = 'active'; color = '#00FF00'; title = 'âœ… طھظ… ظپظƒ ط§ظ„ط­ط¸ط± ظˆط§ظ„طھط¬ظ…ظٹط¯ ط¹ظ† ط§ظ„ط·ظ„ط¨';
        }

        const keyRef = doc(db, "orders", keyId);
        const keySnap = await getDoc(keyRef);
        
        if (!keySnap.exists()) {
          return interaction.editReply({ content: 'â‌Œ ط§ظ„ط·ظ„ط¨ ط؛ظٹط± ظ…ظˆط¬ظˆط¯ ظپظٹ ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ.' });
        }
        
        const keyData = keySnap.data();

        if ((newStatus === 'banned' || newStatus === 'frozen') && keyData.usedByUid) {
          const userRef = doc(db, "users", keyData.usedByUid);
          await setDoc(userRef, { isVIP: false }, { merge: true });
        }

        await setDoc(keyRef, { status: newStatus }, { merge: true });

        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(`طھظ… طھط·ط¨ظٹظ‚ ط§ظ„ط¥ط¬ط±ط§ط، ط¹ظ„ظ‰ ط§ظ„ظ…ظپطھط§ط­: \`${keyId}\``)
          .setColor(color)
          .setFooter({ text: 'طھظ…طھ ط§ظ„ظ…ط²ط§ظ…ظ†ط© ظپظˆط±ط§ظ‹ ظ…ط¹ ط§ظ„ظ…ظˆظ‚ط¹' });
          
        await interaction.editReply({ embeds: [embed] });

      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: 'â‌Œ ظپط´ظ„ ط§ظ„ط§طھطµط§ظ„ ط¨ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ. ط­ط§ظˆظ„ ط«ط§ظ†ظٹط©.' });
      }
    }

    // C. Delete Handler
    else if (interaction.customId === 'modal_delete') {
      await interaction.deferReply({ ephemeral: true });
      const keyId = interaction.fields.getTextInputValue('input_key').trim().replace(/\s/g, '');
      
      try {
        const keyRef = doc(db, "orders", keyId);
        const keySnap = await getDoc(keyRef);
        
        if (!keySnap.exists()) {
          return interaction.editReply({ content: 'â‌Œ ط§ظ„ط·ظ„ط¨ ط؛ظٹط± ظ…ظˆط¬ظˆط¯ ظپظٹ ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ.' });
        }
        
        const keyData = keySnap.data();
        if (keyData.usedByUid) {
          const userRef = doc(db, "users", keyData.usedByUid);
          await setDoc(userRef, { isVIP: false }, { merge: true });
        }

        await deleteDoc(keyRef);

        const embed = new EmbedBuilder()
          .setTitle('ًں—‘ï¸ڈ طھظ… ط­ط°ظپ ط§ظ„ط·ظ„ط¨ ظ†ظ‡ط§ط¦ظٹط§ظ‹')
          .setDescription(`ط§ظ„ط·ظ„ط¨ \`${keyId}\` ظ…ظڈط³ط­ ظ…ظ† ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ ظ†ظ‡ط§ط¦ظٹط§ظ‹.`)
          .setColor('#FF0000');
          
        await interaction.editReply({ embeds: [embed] });
      } catch (err) {
        console.error(err);
        await interaction.editReply({ content: 'â‌Œ ظپط´ظ„ ط§ظ„ط­ط°ظپ ط¨ط³ط¨ط¨ ط®ط·ط£ ط¯ط§ط®ظ„ظٹ.' });
      }
    }
  }
});

// ====== Sync Announcements to Firebase ======
const ANNOUNCE_CHANNEL_ID = '1416534916027519037';

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (message.channelId === ANNOUNCE_CHANNEL_ID) {
    try {
      const attachments = message.attachments.map(a => a.url); // Extract file/image URLs
      const content = message.content;
      
      // Auto-generate ID using doc() without path
      const docRef = doc(collection(db, "notifications"));
      
      await setDoc(docRef, {
        content: content,
        attachments: attachments,
        author: message.author.username,
        avatar: message.author.displayAvatarURL(),
        createdAt: new Date().toISOString()
      });
      
      console.log(`âœ… Notification synced to Firebase: ${content.substring(0, 30)}...`);
    } catch (err) {
      console.error('â‌Œ Failed to sync notification to Firebase:', err);
    }
  }
});

// ====== Auto-Send Buy Panel in Tickets ======
client.on('channelCreate', async (channel) => {
  // Check if it's an actual channel object and has a name with the ticket emoji
  if (channel && channel.name && channel.name.includes('ًںژ«')) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('ًں›’ ظ‚ط³ظ… ط§ظ„ظ…ط¨ظٹط¹ط§طھ - ظ…طھط¬ط± T3N')
        .setDescription('ط£ظ‡ظ„ط§ظ‹ ط¨ظƒ ظپظٹ ظ‚ط³ظ… ط§ظ„ط´ط±ط§ط،طŒ\nط§ظ„ط±ط¬ط§ط، ط§ظ„ط¶ط؛ط· ط¹ظ„ظ‰ ط§ظ„ط²ط± ط¨ط§ظ„ط£ط³ظپظ„ ظپظ‚ط· ط¹ظ†ط¯ ط§ظ„ط§ط³طھط¹ط¯ط§ط¯ ظ„ظ„ط´ط±ط§ط، ظˆظ„ط§ط®طھظٹط§ط± ط§ظ„ظ…ظ†طھط¬ ظˆط§ط³طھظƒظ…ط§ظ„ ط®ط·ظˆط§طھ ط§ظ„ط¯ظپط¹.')
        .setColor('#1E90FF');

      const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('buy_panel_btn')
          .setLabel('ظ…ط³طھط¹ط¯ ظ„ظ„ط´ط±ط§ط، طں')
          .setStyle(ButtonStyle.Primary)
      );

      // Wait a short time to allow bot permissions/ticket messages to load
      setTimeout(async () => {
        await channel.send({ embeds: [embed], components: [btn] });
      }, 2000);
      
      console.log(`âœ… Sent Buy Panel in new ticket: ${channel.name}`);
    } catch (err) {
      console.error(`â‌Œ Failed to send Buy Panel in ticket ${channel.name}:`, err);
    }
  }
});

// ====== Voice Welcome Logic ======
const WELCOME_VC_ID = '1396967239948701859';

async function connectToWelcomeChannel() {
  const guild = client.guilds.cache.get('1396959491786018826');
  if (!guild) return;
  const channel = guild.channels.cache.get(WELCOME_VC_ID);
  if (!channel) return;

  try {
    joinVoiceChannel({
      channelId: WELCOME_VC_ID,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
    console.log(`ًں“، [Voice] Permanent connection established in ${channel.name}`);
  } catch (err) {
    console.error('â‌Œ Failed to join permanent channel:', err);
  }
}

client.on('ready', () => {
  connectToWelcomeChannel();
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  // Only react if someone joins the specific Welcome VC
  if (!oldState.channelId && newState.channelId === WELCOME_VC_ID) {
    const channel = newState.channel;
    if (!channel) return;

    if (newState.member.user.bot) return;

    console.log(`ًں”ٹ [Voice] ${newState.member.user.tag} entered the welcome room. Playing sound...`);

    try {
      const connection = joinVoiceChannel({
        channelId: WELCOME_VC_ID,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const resourcePath = path.join(__dirname, 'welcome.wav');
      
      if (!fs.existsSync(resourcePath)) {
        console.error('â‌Œ welcome.wav missing.');
        return;
      }

      const resource = createAudioResource(resourcePath);
      player.play(resource);
      connection.subscribe(player);

      // We do NOT destroy the connection here so it stays static
      player.on('error', error => console.error(`â‌Œ Audio error: ${error.message}`));

    } catch (error) {
      console.error('â‌Œ [Voice Trigger Error]:', error);
    }
  }
});

// ==========================================
// ====== AI Chatbot Logic (Gemma4:31b) =====
// ==========================================
const axios = require('axios');
const AI_MODEL = 'gemma4:31b';
// ط¥ط¬ظ„ط¨ ط§ظ„ظ…ظپطھط§ط­ ظ…ظ† ظ…ظ„ظپ .env ط§ظˆ ط­ط·ظ‡ ظ‡ظ†ط§ ظ„ظˆ ط±ظٹظ„ظˆظٹ
const AI_API_KEY = process.env.AI_API_KEY || 'a20429c9b229429ebb6807f3950676b7.ypGQv33qB02UX8CYqciG_Lmv';
const AI_API_URL = process.env.AI_API_URL || 'https://ollama.com/api/chat';
const AI_CHANNEL_ID = '1494851523010625562';
const conversationHistory = new Map();

const SYSTEM_INSTRUCTION = `
ط£ظ†طھ "ط¨ظˆطھ T3N". ط®ظˆظٹظ†ط§ ط§ظ„ط³ط¹ظˆط¯ظٹ ط§ظ„ط°ظƒظٹ ظپظٹ ط¯ظٹط³ظƒظˆط±ط¯ ظ…طھط¬ط± "T3N TEAM".
ظˆط¸ظٹظپطھظƒ: ط®ط¯ظ…ط© ط¹ظ…ظ„ط§ط، ظˆط¯ط¹ظ… ظپظ†ظٹ ظ„ظ…ظ†طھط¬ط§طھ ط§ظ„ط³ط¨ظˆظپط± (Spoofer) + ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ظپظˆط§طھظٹط±.

ط´ط®طµظٹطھظƒ:
- ظ„ظ‡ط¬ط© ط³ط¹ظˆط¯ظٹط© ظ‚ظˆظٹط©: "ظٹط§ ظˆط­ط´"طŒ "ط§ط¨ط´ط±"طŒ "ظ„ط§ طھط´ظٹظ„ ظ‡ظ…"طŒ "ط³ظ…"طŒ "ظƒظپظˆ".
- ط±ط¯ظˆط¯ظƒ ظ…ط®طھطµط±ط© ظˆظ…ظپظٹط¯ط© ط¬ط¯ط§ظ‹طŒ ظ„ط§ طھظƒطھط¨ ط¬ط±ط§ط¦ط¯ ظ…ط·ظˆظ„ط©.

ط§ظ„ظ…ظ†طھط¬ط§طھ (ط§ط­ظپط¸ظ‡ط§ طµظ…):
1. ط³ط¨ظˆظپط± ظپظˆط±طھظ†ط§ظٹطھ (49.99 ط±ظٹط§ظ„): ظٹظپظƒ ط¨ط§ظ†ط¯ ظپظˆط±طھظ†ط§ظٹطھ HWID ظ†ظ‡ط§ط¦ظٹط§ظ‹. ط§ط³طھط®ط¯ط§ظ… ظ…ط±ط© ظˆط§ط­ط¯ط©. ظٹط¯ط¹ظ… ظƒظ„ ط§ظ„ظ…ط°ط±ط¨ظˆط±ط¯ط§طھ (ط¨ط¹ط¶ ط£ط¬ظ‡ط²ط© ASUS ظ…ظ…ظƒظ† ظ…ط§ طھط´طھط؛ظ„).
2. ط³ط¨ظˆظپط± ط¨ظٹط±ظ… ط£ظ„ط¹ط§ط¨ (35 ط±ظٹط§ظ„): ظٹظپظƒ ط¨ط§ظ†ط¯ ط¬ظ…ظٹط¹ ط§ظ„ط£ظ„ط¹ط§ط¨ (ظƒظˆط¯طŒ ظپط§ظ„ظˆطŒ ط§ط¨ظƒط³طŒ ظپط§ظٹظپ ط¥ظ…) ظ…ط§ ط¹ط¯ط§ ظپظˆط±طھظ†ط§ظٹطھ. ط§ط³طھط®ط¯ط§ظ… ظ…ط±ط© ظˆط§ط­ط¯ط©.
3. ط®ط¯ظ…ط© VIP (200 ط±ظٹط§ظ„): ظ…ظپطھط§ط­ ط®ط§طµ ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط© ظ„ط¬ظ…ظٹط¹ ط§ظ„ط£ظ„ط¹ط§ط¨ (ظˆظ…ط¹ظ‡ط§ ظپظˆط±طھظ†ط§ظٹطھ). ظƒظ„ ظ…ط§ طھط¨ظ†ط¯طھ طھظپظƒ ط¨ط§ظ†ط¯ظƒ ط¨ظ†ظپط³ظƒ.
4. ط·ظ„ط¨ ط®ط§طµ / ط¯ط¹ظ… ظپظ†ظٹ (35 ط±ظٹط§ظ„): ط§ظ„ظپط±ظٹظ‚ ظٹط¯ط®ظ„ ط¨ط¬ظ‡ط§ط²ظƒ ظˆظٹط³ظˆظٹ ظ„ظƒ ط§ظ„ط³ط¨ظˆظپط±.

ط£ط³ط¦ظ„ط© ط´ط§ط¦ط¹ط© (ط±ط¯ظˆط¯ظƒ):
- "ط§ظ„ظ…ظپطھط§ط­ ظٹط´طھط؛ظ„ ط·ظˆظ„ ط§ظ„ظˆظ‚طھطں" -> "ظ„ط§طŒ ط§ط³طھط®ط¯ط§ظ…ظ‡ ظ…ط±ط© ظˆط§ط­ط¯ط© ط¨ط³. ظ„ظˆ طھط¨ط؛ظ‰ ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط© ط®ط° VIP."
- "ظٹط­طھط§ط¬ ظپظˆط±ظ…ط§طھطں" -> "ط¨ط§ظ„ط؛ط§ظ„ط¨ ظ„ط§. ط¨ط³ ظ„ظˆ ط¸ظ‡ط±طھ ظ…ط´ظƒظ„ط© ظˆظ‚طھظ‡ط§ ط¨ظ†ط¹ط±ظپ."
- "ظ„ط§ط²ظ… ط£ط·ظپظٹ ط§ظ„ط­ظ…ط§ظٹط©طں" -> "ط§ظٹظ‡ ظ…ظ‡ظ… ط¬ط¯ط§ظ‹ ط·ظپ Windows Defender ط¹ط´ط§ظ† ظٹط´طھط؛ظ„."
- "ط´ط±ظٹطھ ط§ظ„ط­ظٹظ† ظˆط´ ط£ط³ظˆظٹطں" -> "طھظپط¶ظ„ ط§ظ„ط´ط±ط­ ظˆط§ظ„طھط­ظ…ظٹظ„ ظ…ظ† ط§ظ„ظ…طھط¬ط±طŒ ظˆظ„ط§ طھظ†ط³ظ‰ طھظ‚ظٹظ…ظ†ط§."

طھط­ظ„ظٹظ„ ط§ظ„طµظˆط± ظ„ظ„ظپظˆط§طھظٹط±:
ط¥ط°ط§ ط£ط±ط³ظ„ ط§ظ„ط¹ظ…ظٹظ„ طµظˆط±ط©طŒ ط§ظپط­طµظ‡ط§. ط¥ط°ط§ ظپط§طھظˆط±ط© ط¯ظپط¹ ط£ظˆ ط­ظˆط§ظ„ط© ط¨ظ†ظƒظٹط© ط¨ط§ط±ظƒ ظ„ظ‡. ط¥ط°ط§ ظƒط§ظ†طھ ط´ظ‡ط§ط¯ط© ط´ظƒط± ظ‚ظ„: "ظ‡ط°ظٹ ط´ظ‡ط§ط¯ط© ط´ظƒط± ظ…ظˆ ظپط§طھظˆط±ط© ظٹط§ ظˆط­ط´طŒ ط£ط±ط³ظ„ طµظˆط±طھ ط§ظ„ط¥ظٹطµط§ظ„ ط£ظˆ ط­ظˆط§ظ„ط© ط§ظ„ط¯ظپط¹."
`;

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

// ====== AI Chatbot Logic ======
client.on('messageCreate', async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    // React only in specific channel
    if (message.channel.id !== TARGET_CHANNEL_ID) return;

    await message.channel.sendTyping();

    // Check for images
    let images = [];
    if (message.attachments.size > 0) {
        for (const attachment of message.attachments.values()) {
            if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                try {
                    const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
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

// ====== AI Chatbot Logic ======
client.on('messageCreate', async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    // React only in specific channel
    if (message.channel.id !== TARGET_CHANNEL_ID) return;

    await message.channel.sendTyping();

    // Check for images
    let images = [];
    if (message.attachments.size > 0) {
        for (const attachment of message.attachments.values()) {
            if (attachment.contentType && attachment.contentType.startsWith('image/')) {
                try {
                    const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
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
client.login(DISCORD_TOKEN).catch(err => {
  console.error('â‌Œ FATAL: Discord login failed:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('â‌Œ Unhandled Rejection:', err);
});
