// bot2.js - Código unificado y limpio (todo en 1 archivo)
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Variables desde entorno
const AUTO_PING_CHANNEL_ID = process.env.AUTO_PING_CHANNEL_ID;
const ACTIVITIES_CHANNEL_ID = process.env.ACTIVITIES_CHANNEL_ID;
const CALLER_ROLE = process.env.CALLER_ROLE;
const BOT2_TOKEN = process.env.BOT2_TOKEN;

// ----------------------
// Estado: voice channels temporales por actividad
// ----------------------
let staticsVoiceChannelId = null;
let grupalVoiceChannelId = null;
let doradosVoiceChannelId = null;
let gankVoiceChannelId = null;

// =====================================================
// ================ ESTÁTICAS T7 =======================
// =====================================================
let staticsRoles = { tank: [], healer: [], flamigero: [], rompe: [], shadow: [] };
const ROLE_LIMIT = { tank: 1, healer: 1, flamigero: 1, rompe: 1, shadow: 1 };

function getStaticsEmbed(channelId = null) {
  const embed = new EmbedBuilder()
    .setTitle("📌 Estática T7 - Selección de Roles")
    .setColor("#00AEEF")
    .setDescription("Selecciona tu rol para la Estática.")
    .addFields(
      { name: "🛡️ TANK (1)", value: `${staticsRoles.tank.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "✨ HEALER (1)", value: `${staticsRoles.healer.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "🔥 FLAMIGERO (1)", value: `${staticsRoles.flamigero.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "⚔️ ROMPEREINOS (1)", value: `${staticsRoles.rompe.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "🌑 SHADOWCALLER (1)", value: `${staticsRoles.shadow.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` }
    );
  if (channelId) embed.addFields({ name: "🔊 Canal de voz", value: `<#${channelId}>` });
  return embed;
}

function getStaticsButtons(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("tank_s").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || staticsRoles.tank.length >= 1),
      new ButtonBuilder().setCustomId("healer_s").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || staticsRoles.healer.length >= 1),
      new ButtonBuilder().setCustomId("flamigero_s").setLabel("Flamigero").setStyle(ButtonStyle.Secondary).setDisabled(disabled || staticsRoles.flamigero.length >= 1),
      new ButtonBuilder().setCustomId("rompe_s").setLabel("RompeReinos").setStyle(ButtonStyle.Danger).setDisabled(disabled || staticsRoles.rompe.length >= 1),
      new ButtonBuilder().setCustomId("shadow_s").setLabel("Shadowcaller").setStyle(ButtonStyle.Primary).setDisabled(disabled || staticsRoles.shadow.length >= 1)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cerrar_estatica").setLabel("🛑 Cerrar (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

const staticsMap = { tank_s: "tank", healer_s: "healer", flamigero_s: "flamigero", rompe_s: "rompe", shadow_s: "shadow" };

// =====================================================
// ================ ACTIVIDAD GRUPAL ===================
// =====================================================
let grupalRoles = { tank: [], healer: [], flamigero: [], prisma: [], shadow: [], badon: [] };
const GRUPAL_LIMIT = { tank: 1, healer: 1, flamigero: 1, prisma: 1, shadow: 1, badon: 1 };

function getGrupalEmbed(channelId = null) {
  const embed = new EmbedBuilder()
    .setTitle("⚔️ Actividad Grupal - Selección de Roles")
    .setColor("#9b59b6")
    .setDescription("Selecciona tu rol para la actividad grupal.")
    .addFields(
      { name: "🛡️ TANK (1)", value: `${grupalRoles.tank.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "✨ HEALER (1)", value: `${grupalRoles.healer.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "🔥 FLAMIGERO (1)", value: `${grupalRoles.flamigero.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "💎 PRISMA (1)", value: `${grupalRoles.prisma.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "🌑 SHADOWCALLER (1)", value: `${grupalRoles.shadow.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "⚡ BADON (1)", value: `${grupalRoles.badon.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` }
    );
  if (channelId) embed.addFields({ name: "🔊 Canal de voz", value: `<#${channelId}>` });
  return embed;
}

function getGrupalButtons(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("tank_g").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || grupalRoles.tank.length >= 1),
      new ButtonBuilder().setCustomId("healer_g").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || grupalRoles.healer.length >= 1),
      new ButtonBuilder().setCustomId("flamigero_g").setLabel("Flamigero").setStyle(ButtonStyle.Danger).setDisabled(disabled || grupalRoles.flamigero.length >= 1)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("prisma_g").setLabel("Prisma").setStyle(ButtonStyle.Secondary).setDisabled(disabled || grupalRoles.prisma.length >= 1),
      new ButtonBuilder().setCustomId("shadow_g").setLabel("Shadowcaller").setStyle(ButtonStyle.Primary).setDisabled(disabled || grupalRoles.shadow.length >= 1),
      new ButtonBuilder().setCustomId("badon_g").setLabel("Badon").setStyle(ButtonStyle.Primary).setDisabled(disabled || grupalRoles.badon.length >= 1)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cerrar_grupal").setLabel("🛑 Cerrar (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

const grupalMap = { tank_g: "tank", healer_g: "healer", flamigero_g: "flamigero", prisma_g: "prisma", shadow_g: "shadow", badon_g: "badon" };

// =====================================================
// ============ DORADOS T7 BRACILEAN ===================
// =====================================================
let doradosRoles = { tank: [], healer: [], stopper: [], flamigero: [], perfora: [] };
const DORADOS_LIMIT = { tank: 1, healer: 1, stopper: 1, flamigero: 1, perfora: 3 };

function getDoradosEmbed(channelId = null) {
  const embed = new EmbedBuilder()
    .setTitle("💛 DORADOS T7 BRACILEAN")
    .setColor("#f1c40f")
    .setDescription("Selecciona tu rol para la actividad Dorados.")
    .addFields(
      { name: "🛡️ TANK (1)", value: `${doradosRoles.tank.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "✨ HEALER (1)", value: `${doradosRoles.healer.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "⛔ MALDI / STOPPER (1)", value: `${doradosRoles.stopper.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "🔥 FLAMIGERO (1)", value: `${doradosRoles.flamigero.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "🌫️ PERFORA NIEBLAS (3)", value: `${doradosRoles.perfora.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` }
    );
  if (channelId) embed.addFields({ name: "🔊 Canal de voz", value: `<#${channelId}>` });
  return embed;
}

function getDoradosButtons(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("tank_d").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || doradosRoles.tank.length >= 1),
      new ButtonBuilder().setCustomId("healer_d").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || doradosRoles.healer.length >= 1),
      new ButtonBuilder().setCustomId("stopper_d").setLabel("Stopper").setStyle(ButtonStyle.Danger).setDisabled(disabled || doradosRoles.stopper.length >= 1)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("flamigero_d").setLabel("Flamigero").setStyle(ButtonStyle.Secondary).setDisabled(disabled || doradosRoles.flamigero.length >= 1),
      new ButtonBuilder().setCustomId("perfora_d").setLabel("Perfora Nieblas").setStyle(ButtonStyle.Primary).setDisabled(disabled || doradosRoles.perfora.length >= 3)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cerrar_dorados").setLabel("🛑 Cerrar (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

const doradosMap = { tank_d: "tank", healer_d: "healer", stopper_d: "stopper", flamigero_d: "flamigero", perfora_d: "perfora" };

// =====================================================
// ===================== GANK T7 =======================
// =====================================================
let gankRoles = { tank: [], cc: [], healer: [], dps: [] };
const GANK_LIMIT = { tank: 1, cc: 1, healer: 1, dps: 4 };

function getGankEmbed(channelId = null) {
  const embed = new EmbedBuilder()
    .setTitle("🔴 Gankeo T7")
    .setColor("#e74c3c")
    .setDescription("Selecciona tu rol para el Gank T7.")
    .addFields(
      { name: "🛡️ TANK (1)", value: `${gankRoles.tank.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "🪄 CC (1)", value: `${gankRoles.cc.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "✨ HEALER (1)", value: `${gankRoles.healer.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
      { name: "⚔️ DPS (4)", value: `${gankRoles.dps.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` }
    );
  if (channelId) embed.addFields({ name: "🔊 Canal de voz", value: `<#${channelId}>` });
  return embed;
}

function getGankButtons(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("tank_k").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || gankRoles.tank.length >= 1),
      new ButtonBuilder().setCustomId("cc_k").setLabel("CC").setStyle(ButtonStyle.Secondary).setDisabled(disabled || gankRoles.cc.length >= 1),
      new ButtonBuilder().setCustomId("healer_k").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || gankRoles.healer.length >= 1)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("dps_k").setLabel("DPS").setStyle(ButtonStyle.Danger).setDisabled(disabled || gankRoles.dps.length >= 4)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cerrar_gank").setLabel("🛑 Cerrar (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

const gankMap = { tank_k: "tank", cc_k: "cc", healer_k: "healer", dps_k: "dps" };

// =====================================================
// ==================== HELPERS VOICE ==================
// =====================================================
async function createVoiceChannel(name, guild, referenceChannel) {
  try {
    const options = { type: ChannelType.GuildVoice };
    if (referenceChannel && referenceChannel.parentId) options.parent = referenceChannel.parentId;
    const vc = await guild.channels.create({
      name,
      ...options,
      permissionOverwrites: [
        {
          id: guild.id,
          allow: []
        }
      ]
    });
    return vc;
  } catch (err) {
    console.error("No se pudo crear canal de voz:", err);
    return null;
  }
}

async function deleteVoiceChannel(channelId, guild) {
  if (!channelId) return;
  const ch = guild.channels.cache.get(channelId);
  if (!ch) return;
  try { await ch.delete().catch(() => {}); } catch (err) { console.error("No se pudo eliminar canal de voz:", err); }
}

// =====================================================
// ===================== READY =========================
// =====================================================
client.on("ready", () => {
  console.log(`Bot iniciado como ${client.user.tag}`);
});

// =====================================================
// ================= MENÚ PRINCIPAL ====================
// =====================================================


function getMainMenuEmbed() { return new EmbedBuilder() .setTitle("📢 Centro de Actividades") .setColor("#2ecc71") .setDescription( "Bienvenido al panel principal.\n\n" + "Selecciona el tipo de actividad que deseas crear. Cada opción generará su propio panel con roles y un canal de voz automático." ) .addFields( { name: "⚔️ Actividades Disponibles", value: "🟦 Grupales — Actividades generales para el equipo.\n" + "🟩 Estáticas T7 — Grupos de roles fijos.\n" + "🟨 Dorados T7 Bracilean — Actividad especial de farmeo.\n" + "🟥 Gank T7 — Actividad PvP de cacería.", } ) .setThumbnail("https://cdn-icons-png.flaticon.com/512/854/854878.png") .setFooter({ text: "Clan ツLORD AMERICA • Sistema de Actividades" }) .setTimestamp(); }

function getMainMenuButtons() { return [ new ActionRowBuilder().addComponents( new ButtonBuilder() .setCustomId("actividad_grupales") .setLabel("Grupales") .setEmoji("🟦") .setStyle(ButtonStyle.Primary),

new ButtonBuilder()
    .setCustomId("actividad_estaticas")
    .setLabel("Estáticas T7")
    .setEmoji("🟩")
    .setStyle(ButtonStyle.Success)
),

new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("actividad_dorados")
    .setLabel("Dorados T7")
    .setEmoji("🟨")
    .setStyle(ButtonStyle.Secondary),

  new ButtonBuilder()
    .setCustomId("actividad_gank")
    .setLabel("Gank T7")
    .setEmoji("🟥")
    .setStyle(ButtonStyle.Danger)
)

]; }

module.exports = { getMainMenuEmbed, getMainMenuButtons };

// =====================================================
// =============== HANDLERS DE BOTONES =================
// =====================================================
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const activitiesChannel = interaction.guild.channels.cache.get(ACTIVITIES_CHANNEL_ID);
  if (!activitiesChannel) return interaction.reply({ content: "No se encontró el canal de actividades.", ephemeral: true });

  // ---------- ESTÁTICA ----------
  if (interaction.customId === "actividad_estaticas") {
    staticsRoles = { tank: [], healer: [], flamigero: [], rompe: [], shadow: [] };
    const vc = await createVoiceChannel(`Estática T7 - Voz`, interaction.guild, activitiesChannel);
    staticsVoiceChannelId = vc ? vc.id : null;
    await activitiesChannel.send({ content: "@here @everyone **Estática T7**", embeds: [getStaticsEmbed(staticsVoiceChannelId)], components: getStaticsButtons() });
    return interaction.reply({ content: "Estática creada.", ephemeral: true });
  }

  if (interaction.customId === "cerrar_estatica") {
    if (!interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) return interaction.reply({ content: "❌ Solo CALLER puede cerrar esta actividad.", ephemeral: true });
    await interaction.update({ content: "🛑 Actividad Estática cerrada.", embeds: [getStaticsEmbed(staticsVoiceChannelId)], components: getStaticsButtons(true) });
    await deleteVoiceChannel(staticsVoiceChannelId, interaction.guild);
    staticsVoiceChannelId = null;
    return;
  }

  if (staticsMap[interaction.customId]) {
    const rol = staticsMap[interaction.customId];
    const user = interaction.user.id;
    if (staticsRoles[rol].length >= ROLE_LIMIT[rol]) return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
    for (const r in staticsRoles) staticsRoles[r] = staticsRoles[r].filter(id => id !== user);
    staticsRoles[rol].push(user);
    return interaction.update({ embeds: [getStaticsEmbed(staticsVoiceChannelId)], components: getStaticsButtons() });
  }

  // ---------- GRUPAL ----------
  if (interaction.customId === "actividad_grupales") {
    grupalRoles = { tank: [], healer: [], flamigero: [], prisma: [], shadow: [], badon: [] };
    const vc = await createVoiceChannel(`Grupal - Voz`, interaction.guild, activitiesChannel);
    grupalVoiceChannelId = vc ? vc.id : null;
    await activitiesChannel.send({ content: "@here @everyone **Actividad Grupal**", embeds: [getGrupalEmbed(grupalVoiceChannelId)], components: getGrupalButtons() });
    return interaction.reply({ content: "Actividad grupal creada.", ephemeral: true });
  }

  if (interaction.customId === "cerrar_grupal") {
    if (!interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) return interaction.reply({ content: "❌ Solo CALLER puede cerrar esta actividad.", ephemeral: true });
    await interaction.update({ content: "🛑 Actividad Grupal cerrada.", embeds: [getGrupalEmbed(grupalVoiceChannelId)], components: getGrupalButtons(true) });
    await deleteVoiceChannel(grupalVoiceChannelId, interaction.guild);
    grupalVoiceChannelId = null;
    return;
  }

  if (grupalMap[interaction.customId]) {
    const rol = grupalMap[interaction.customId];
    const user = interaction.user.id;
    if (grupalRoles[rol].length >= GRUPAL_LIMIT[rol]) return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
    for (const r in grupalRoles) grupalRoles[r] = grupalRoles[r].filter(id => id !== user);
    grupalRoles[rol].push(user);
    return interaction.update({ embeds: [getGrupalEmbed(grupalVoiceChannelId)], components: getGrupalButtons() });
  }

  // ---------- DORADOS ----------
  if (interaction.customId === "actividad_dorados") {
    doradosRoles = { tank: [], healer: [], stopper: [], flamigero: [], perfora: [] };
    const vc = await createVoiceChannel(`Dorados T7 - Voz`, interaction.guild, activitiesChannel);
    doradosVoiceChannelId = vc ? vc.id : null;
    await activitiesChannel.send({ content: "@here @everyone **💛 DORADOS T7 BRACILEAN**", embeds: [getDoradosEmbed(doradosVoiceChannelId)], components: getDoradosButtons() });
    return interaction.reply({ content: "Actividad Dorados creada.", ephemeral: true });
  }

  if (interaction.customId === "cerrar_dorados") {
    if (!interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) return interaction.reply({ content: "❌ Solo CALLER puede cerrar esta actividad.", ephemeral: true });
    await interaction.update({ content: "🛑 Actividad Dorados cerrada.", embeds: [getDoradosEmbed(doradosVoiceChannelId)], components: getDoradosButtons(true) });
    await deleteVoiceChannel(doradosVoiceChannelId, interaction.guild);
    doradosVoiceChannelId = null;
    return;
  }

  if (doradosMap[interaction.customId]) {
    const rol = doradosMap[interaction.customId];
    const user = interaction.user.id;
    if (doradosRoles[rol].length >= DORADOS_LIMIT[rol]) return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
    for (const r in doradosRoles) doradosRoles[r] = doradosRoles[r].filter(id => id !== user);
    doradosRoles[rol].push(user);
    return interaction.update({ embeds: [getDoradosEmbed(doradosVoiceChannelId)], components: getDoradosButtons() });
  }

  // ---------- GANK ----------
  if (interaction.customId === "actividad_gank") {
    gankRoles = { tank: [], cc: [], healer: [], dps: [] };
    const vc = await createVoiceChannel(`Gankeo T7 - Voz`, interaction.guild, activitiesChannel);
    gankVoiceChannelId = vc ? vc.id : null;
    await activitiesChannel.send({ content: "@here @everyone **🔴 Gankeo T7**", embeds: [getGankEmbed(gankVoiceChannelId)], components: getGankButtons() });
    return interaction.reply({ content: "Actividad Gank creada.", ephemeral: true });
  }

  if (interaction.customId === "cerrar_gank") {
    if (!interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) return interaction.reply({ content: "❌ Solo CALLER puede cerrar la actividad.", ephemeral: true });
    await interaction.update({ content: "🛑 Actividad Gank cerrada.", embeds: [getGankEmbed(gankVoiceChannelId)], components: getGankButtons(true) });
    await deleteVoiceChannel(gankVoiceChannelId, interaction.guild);
    gankVoiceChannelId = null;
    return;
  }

  if (gankMap[interaction.customId]) {
    const rol = gankMap[interaction.customId];
    const user = interaction.user.id;
    if (gankRoles[rol].length >= GANK_LIMIT[rol]) return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
    for (const r in gankRoles) gankRoles[r] = gankRoles[r].filter(id => id !== user);
    gankRoles[rol].push(user);
    return interaction.update({ embeds: [getGankEmbed(gankVoiceChannelId)], components: getGankButtons() });
  }
});

// =====================================================
// ===================== LOGIN =========================
// =====================================================
if (!BOT2_TOKEN) {
  console.error("Falta BOT2_TOKEN en las variables de entorno. No se puede iniciar.");
  process.exit(1);
}
client.login(BOT2_TOKEN);
