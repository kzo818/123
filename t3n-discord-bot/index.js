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
  AudioPlayerStatus,
  getVoiceConnection
} = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');
const play = require('play-dl');

// =============== Web Server (Keep-Alive) ===============
const webServer = express();
webServer.get('/', (req, res) => res.send('T3N SYSTEM ALIVE 24/7'));
const PORT = process.env.PORT || 3000;
webServer.listen(PORT, () => console.log(`🚀 Web Server is running on port ${PORT}`));

// ====== Firebase Setup ======
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, deleteDoc } = require('firebase/firestore');

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
    GatewayIntentBits.GuildMembers
  ] 
});

const TARGET_CHANNEL_ID = process.env.CHANNEL_ID || '1473614279520550944';
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

if (!DISCORD_TOKEN) {
  console.error('⚠️ [ERROR] DISCORD_TOKEN is not set in .env file!');
  process.exit(1);
}

// Global Music Player Engine
let globalAudioPlayer = createAudioPlayer();
let isPaused = false;

// ====== Key / Order Generators ======
function generateOrderNumber() {
  const chars = '0123456789';
  let result = '24';
  for (let i = 0; i < 7; i++) {
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

// ====== Ready & Commands ======
client.once('ready', async () => {
  console.log(`✅ Logged in to Discord as ${client.user.tag}`);
  
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
  const GUILD_ID = '1396959491786018826'; 
  
  try {
    console.log('🔄 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: [
        {
          name: 'koz',
          description: 'فتح لوحة التحكم الاحترافية للمتجر والإدارة (الأدمن فقط)',
          default_member_permissions: String(PermissionFlagsBits.Administrator)
        }
      ] }
    );
    console.log('✅ Commands registered!');
  } catch (error) {
    console.error('⚠️ Failed to register slash commands:', error);
  }
});

// ====== Main Interaction ======
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'koz') {
    if (interaction.channelId !== TARGET_CHANNEL_ID) {
      return interaction.reply({ content: `❌ استخدم الأمر هنا <#${TARGET_CHANNEL_ID}>`, ephemeral: true });
    }
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ لا تملك صلاحيات.', ephemeral: true });
    }

    // Embed 1: Store Panel
    const storeEmbed = new EmbedBuilder()
      .setTitle('🛒 T3N - إدارة الموقع والطلبات')
      .setColor('#00FF7F')
      .setDescription('تحكم كامل بطلبات ومفاتيح الموقع وارتباطها بفايربيس الحقيقي.');

    const rowStore1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn_create_single').setLabel('🔑 إنشاء طلب مفرد').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn_create_bulk').setLabel('📋 إنشاء متعدد').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn_ban').setLabel('🚫 تجميد الطلب').setStyle(ButtonStyle.Danger)
    );

    // Embed 2: Management & Music Panel
    const modEmbed = new EmbedBuilder()
      .setTitle('⚙️ T3N - الإدارة الشاملة والصوتيات')
      .setColor('#FF4500')
      .setDescription('تحكم كامل بالسيرفر: الميوت، الطرد، الرومات الصوتية، وتشغيل ملفات (يوتيوب) بالموسيقى بدقة عالية.')
      .setThumbnail(client.user.displayAvatarURL());

    const rowMusic = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn_voice_join').setLabel('🔊 ادخال البوت للروم').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn_voice_play').setLabel('▶️ تشغيل يوتيوب').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn_voice_pause').setLabel('⏸️ تشغيل / إيقاف').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('btn_voice_stop').setLabel('⏹️ إنهاء الصوت').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('btn_voice_leave').setLabel('🚪 خروج البوت').setStyle(ButtonStyle.Danger)
    );

    const rowMod = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn_mod_mute').setLabel('🔇 إعطاء/فك ميوت').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('btn_mod_deafen').setLabel('🎧 ديفن / فك ديفن').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('btn_mod_kick').setLabel('🔨 طرد عضو').setStyle(ButtonStyle.Danger)
    );

    const rowMsg = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn_msg_room').setLabel('💬 إرسال رسالة لروم').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn_msg_dm').setLabel('📩 إرسال رسالة بالخاص').setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ 
      embeds: [storeEmbed, modEmbed], 
      components: [rowStore1, rowMusic, rowMod, rowMsg], 
      ephemeral: true 
    });
    return;
  }

  if (interaction.isButton() || interaction.isModalSubmit()) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ صلاحيات مرفوضة.', ephemeral: true });
    }
  }

  // ====== Button Handlers ======
  if (interaction.isButton()) {
    const id = interaction.customId;

    // --- STORE BUTTONS ---
    if (id === 'btn_create_single') {
      await interaction.deferReply();
      const code = await createDatabaseKey(interaction.user.tag);
      await interaction.editReply(`✅ تم إنشاء الطلب بنجاح:\n\`\`\`${code}\`\`\``);
    } 
    else if (id === 'btn_create_bulk') {
      const modal = new ModalBuilder().setCustomId('modal_create_bulk').setTitle('إنشاء طلبات متعددة');
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('input_amount').setLabel('العدد: (حد 50)').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      await interaction.showModal(modal);
    }
    else if (id === 'btn_ban') {
      const modal = new ModalBuilder().setCustomId('modal_ban').setTitle('تجميد أو تعطيل طلب');
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('input_key').setLabel('اكتب رقم الطلب:').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      await interaction.showModal(modal);
    }

    // --- MUSIC BUTTONS ---
    else if (id === 'btn_voice_join') {
      const modal = new ModalBuilder().setCustomId('modal_voice_join').setTitle('إدخال البوت لروم صوتي');
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('input_vc').setLabel('أدخل ID الروم الصوتي:').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      await interaction.showModal(modal);
    }
    else if (id === 'btn_voice_play') {
      const modal = new ModalBuilder().setCustomId('modal_voice_play').setTitle('تشغيل يوتيوب أو ميوزك');
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('input_url').setLabel('رابط اليوتيوب Youtube URL:').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      await interaction.showModal(modal);
    }
    else if (id === 'btn_voice_pause') {
      if (isPaused) { globalAudioPlayer.unpause(); isPaused = false; await interaction.reply({content:'▶️ تم استكمال الصوت.', ephemeral:true}); }
      else { globalAudioPlayer.pause(); isPaused = true; await interaction.reply({content:'⏸️ تم إيقاف الصوت مؤقتاً.', ephemeral:true}); }
    }
    else if (id === 'btn_voice_stop') {
      globalAudioPlayer.stop();
      await interaction.reply({ content: '⏹️ تم إنهاء المقطع الصوتي.', ephemeral: true });
    }
    else if (id === 'btn_voice_leave') {
      const connection = getVoiceConnection(interaction.guildId);
      if (connection) { connection.destroy(); await interaction.reply({content:'🚪 تم الخروج من الروم الصوتي.', ephemeral:true}); }
      else { await interaction.reply({content:'❌ البوت ليس في أي روم.', ephemeral:true}); }
    }

    // --- MODERATION BUTTONS ---
    else if (id === 'btn_mod_mute' || id === 'btn_mod_deafen' || id === 'btn_mod_kick') {
      let title = id === 'btn_mod_mute' ? 'ميوت عضو' : (id === 'btn_mod_deafen' ? 'ديفن عضو' : 'طرد عضو');
      const modal = new ModalBuilder().setCustomId(`modal_${id}`).setTitle(title);
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('input_user').setLabel('أدخل ID الخاص بالعضو:').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      await interaction.showModal(modal);
    }

    // --- MESSAGING BUTTONS ---
    else if (id === 'btn_msg_room' || id === 'btn_msg_dm') {
      let title = id === 'btn_msg_room' ? 'إرسال לרوم' : 'إرسال للخاص';
      const modal = new ModalBuilder().setCustomId(`modal_${id}`).setTitle(title);
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('input_target').setLabel('رقم ID (الروم أو الشخص):').setStyle(TextInputStyle.Short).setRequired(true)
      ));
      modal.addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('input_msg').setLabel('الرسالة:').setStyle(TextInputStyle.Paragraph).setRequired(true)
      ));
      await interaction.showModal(modal);
    }
  }

  // ====== Modal Handlers ======
  if (interaction.isModalSubmit()) {
    const id = interaction.customId;

    // STORE
    if (id === 'modal_create_bulk') {
      await interaction.deferReply();
      const amount = parseInt(interaction.fields.getTextInputValue('input_amount'));
      if (isNaN(amount) || amount > 50) return interaction.editReply('❌ خطأ في العدد.');
      const keys = [];
      for (let i = 0; i < amount; i++) keys.push(await createDatabaseKey(interaction.user.tag));
      await interaction.editReply(`✅ تم إنشاء ${amount} طلبات:\n\`\`\`${keys.join('\n')}\`\`\``);
    }
    else if (id === 'modal_ban') {
      await interaction.deferReply({ ephemeral: true });
      const keyId = interaction.fields.getTextInputValue('input_key').trim();
      try {
        const keyRef = doc(db, "orders", keyId);
        await setDoc(keyRef, { status: 'frozen' }, { merge: true });
        await interaction.editReply('✅ تم تجميد الطلب من فايربيس بنجاح.');
      } catch (err) { await interaction.editReply('❌ فشل.'); }
    }

    // VOICE: JOIN
    else if (id === 'modal_voice_join') {
      const vcTarget = interaction.fields.getTextInputValue('input_vc').trim();
      const channel = interaction.guild.channels.cache.get(vcTarget);
      if (!channel || !channel.isVoiceBased()) return interaction.reply({content:'❌ لم يتم العثور على الروم الصوتي.', ephemeral:true});
      try {
        const connection = joinVoiceChannel({ channelId: channel.id, guildId: interaction.guild.id, adapterCreator: interaction.guild.voiceAdapterCreator });
        connection.subscribe(globalAudioPlayer);
        await interaction.reply({content:`✅ البوت دخل الآن لـ ${channel.name}`, ephemeral:true});
      } catch (err) { await interaction.reply({content:'❌ فشل الدخول.', ephemeral:true}); }
    }

    // VOICE: PLAY
    else if (id === 'modal_voice_play') {
      await interaction.deferReply({ ephemeral:true });
      const url = interaction.fields.getTextInputValue('input_url').trim();
      const connection = getVoiceConnection(interaction.guild.id);
      if (!connection) return interaction.editReply('❌ البوت لازم يكون بالروم أولاً! (استخدم زر ادخال البوت)');
      try {
        const stream = await play.stream(url, { discordPlayerCompatibility: true });
        const resource = createAudioResource(stream.stream, { inputType: stream.type });
        globalAudioPlayer.play(resource);
        isPaused = false;
        await interaction.editReply(`▶️ جاري تشغيل المقطع بنجاح!`);
      } catch (err) {
        console.error(err);
        await interaction.editReply('❌ فشل في تشغيل الرابط. تأكد إنه رابط يوتيوب صالح (وليس خاص).');
      }
    }

    // MODERATION: MUTE / DEAFEN / KICK
    else if (id === 'modal_btn_mod_mute' || id === 'modal_btn_mod_deafen' || id === 'modal_btn_mod_kick') {
      await interaction.deferReply({ ephemeral: true });
      const targetUserId = interaction.fields.getTextInputValue('input_user').trim();
      try {
        const member = await interaction.guild.members.fetch(targetUserId);
        if (!member) throw new Error();
        
        if (id === 'modal_btn_mod_mute') {
          const isMuted = member.voice.serverMute;
          await member.voice.setMute(!isMuted);
          await interaction.editReply(`✅ تم ${!isMuted ? 'إعطاء ميوت' : 'فك الميوت'} للعضو.`);
        } 
        else if (id === 'modal_btn_mod_deafen') {
          const isDeaf = member.voice.serverDeaf;
          await member.voice.setDeaf(!isDeaf);
          await interaction.editReply(`✅ تم ${!isDeaf ? 'إعطاء ديفن' : 'فك الديفن'} للعضو.`);
        }
        else if (id === 'modal_btn_mod_kick') {
          await member.kick('Kicked via T3N Admin Panel');
          await interaction.editReply(`✅ تم طرد العضو بنجاح.`);
        }
      } catch (err) {
        await interaction.editReply('❌ فشل! تأكد إن ID العضو صحيح (وإن العضو بالروم إذا كان ميوت/ديفن)، وتأكد إن رتبة البوت أعلى منه.');
      }
    }

    // MESSAGING
    else if (id === 'modal_btn_msg_room') {
      const channelId = interaction.fields.getTextInputValue('input_target').trim();
      const msg = interaction.fields.getTextInputValue('input_msg');
      try {
        const channel = interaction.guild.channels.cache.get(channelId);
        await channel.send(msg);
        await interaction.reply({content:'✅ تم الإرسال بلسان البوت.', ephemeral:true});
      } catch { await interaction.reply({content:'❌ خطأ بالروم.', ephemeral:true}); }
    }
    else if (id === 'modal_btn_msg_dm') {
      const userId = interaction.fields.getTextInputValue('input_target').trim();
      const msg = interaction.fields.getTextInputValue('input_msg');
      try {
        const user = await client.users.fetch(userId);
        await user.send(msg);
        await interaction.reply({content:'✅ تم الإرسال للخاص بنجاح.', ephemeral:true});
      } catch { await interaction.reply({content:'❌ فشل! ربما العضو مقفل الخاص.', ephemeral:true}); }
    }
  }
});

client.login(DISCORD_TOKEN).catch(err => {
  console.error('❌ FATAL: Discord login failed:', err.message);
});
