// bot2.js - Versión FINAL optimizada para Render.com (Discord.js v14) 
// ------------------------------- IMPORTS -------------------------------
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, } = require("discord.js");

// ------------------------------- CLIENT ------------------------------- 
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, ], });

// ------------------------ VARIABLES DE ENTORNO ------------------------
const AUTO_PING_CHANNEL_ID = process.env.AUTO_PING_CHANNEL_ID; const ACTIVITIES_CHANNEL_ID = process.env.ACTIVITIES_CHANNEL_ID; const CALLER_ROLE = process.env.CALLER_ROLE; const BOT2_TOKEN = process.env.BOT2_TOKEN;

// ----------------------- CANALES DE VOZ TEMPORALES ----------------------- 
let staticsVoiceChannelId = null; let grupalVoiceChannelId = null; let doradosVoiceChannelId = null; let gankVoiceChannelId = null;

// ----------------------- SISTEMAS DE ROLES ----------------------------
//ESTÁTICAS
let staticsRoles = { tank: [], healer: [], flamigero: [], rompe: [], shadow: [] }; const ROLE_LIMIT = { tank: 1, healer: 1, flamigero: 1, rompe: 1, shadow: 1 };

// GRUPALES 
 let grupalRoles = { tank: [], healer: [], flamigero: [], prisma: [], shadow: [], badon: [] }; const GRUPAL_LIMIT = { tank: 1, healer: 1, flamigero: 1, prisma: 1, shadow: 1, badon: 1 };

// DORADOS 
 let doradosRoles = { tank: [], healer: [], stopper: [], flamigero: [], perfora: [] }; const DORADOS_LIMIT = { tank: 1, healer: 1, stopper: 1, flamigero: 1, perfora: 3 };

// GANK 
 let gankRoles = { tank: [], cc: [], healer: [], dps: [] }; const GANK_LIMIT = { tank: 1, cc: 1, healer: 1, dps: 4 };

// ----------------------- EMBEDS DE ACTIVIDADES ----------------------------
function getMainMenuEmbed() { return new EmbedBuilder() .setTitle("📢 Centro de Actividades") .setColor("#2ecc71") .setDescription( "Bienvenido al panel principal.\n\n" + "Selecciona el tipo de actividad que deseas crear. Cada opción generará su propio panel con roles y un canal de voz automático." ) .addFields({ name: "⚔️ Actividades Disponibles
