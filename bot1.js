// bot2.js - Bot completo listo para Render.com (Discord.js v14)
// ------------------------------------------------------------
// Requisitos de ENV (Render):
// BOT2_TOKEN, AUTO_PING_CHANNEL_ID, ACTIVITIES_CHANNEL_ID, CALLER_ROLE
// ------------------------------------------------------------

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

// ------------------- Variables de entorno -------------------
const AUTO_PING_CHANNEL_ID = process.env.AUTO_PING_CHANNEL_ID || null;
const ACTIVITIES_CHANNEL_ID = process.env.ACTIVITIES_CHANNEL_ID || null;
const CALLER_ROLE = process.env.CALLER_ROLE || null;
const BOT2_TOKEN = process.env.BOT2_TOKEN || null;

// ------------------- Estado temporal (voice channels) -------------------
let staticsVoiceChannelId = null;
let grupalVoiceChannelId = null;
let doradosVoiceChannelId = null;
let gankVoiceChannelId = null;

// ------------------- Roles y límites -------------------
let staticsRoles = { tank: [], healer: [], flamigero: [], rompe: [], shadow: [] };
const ROLE_LIMIT = { tank: 1, healer: 1, flamigero: 1, rompe: 1, shadow: 1 };

let grupalRoles = { tank: [], healer: [], flamigero: [], prisma: [], shadow: [], badon: [] };
const GRUPAL_LIMIT = { tank: 1, healer: 1, flamigero: 1, prisma: 1, shadow: 1, badon: 1 };

let doradosRoles = { tank: [], healer: [], stopper: [], flamigero: [], perfora: [] };
const DORADOS_LIMIT = { tank: 1, healer: 1, stopper: 1, flamigero: 1, perfora: 3 };

let gankRoles = { tank: [], cc: [], healer: [], dps: [] };
const GANK_LIMIT = { tank: 1, cc: 1, healer: 1, dps: 4 };

// ------------------- Mapas customId -> rol -------------------
const staticsMap = { tank_s: "tank", healer_s: "healer", flamigero_s: "flamigero", rompe_s: "rompe", shadow_s: "shadow" };
const grupalMap = { tank_g: "tank", healer_g: "healer", flamigero_g: "flamigero", prisma_g: "prisma", shadow_g: "shadow", badon_g: "badon" };
const doradosMap = { tank_d: "tank", healer_d: "healer", stopper_d: "stopper", flamigero_d: "flamigero", perfora_d: "perfora" };
const gankMap = { tank_k: "tank", cc_k: "cc", healer_k: "healer", dps_k: "dps" };

// ------------------- Helpers: Embeds y Buttons -------------------

// ---------- Main menu ----------
function getMainMenuEmbed() {
  return new EmbedBuilder()
    .setTitle("📢 Centro de Actividades")
    .setColor("#2ecc71")
    .setDescription(
      "Bienvenido al panel principal.\n\n" +
      "Selecciona el tipo de actividad que deseas crear. Cada opción generará su propio panel con roles y un canal de voz automático."
    )
    .addFields({
      name: "⚔️ Actividades Disponibles",
      value:
        "🟦 Grupales — Actividades generales para el equipo.\n" +
        "🟩 Estáticas T7 — Grupos de roles fijos.\n" +
        "🟨 Dorados T7 Bracilean — Actividad especial de farmeo.\n" +
        "🟥 Gank T7 — Actividad PvP de cacería."
    })
    .setThumbnail("https://cdn-icons-png.flaticon.com/512/854/854878.png")
    .setFooter({ text: "Clan ツLORD AMERICA • Sistema de Actividades" })
    .setTimestamp();
}

function getMainMenuButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("actividad_grupales")
        .setLabel("Grupales")
        .setEmoji("🟦")
        .setStyle(ButtonStyle.Primary),

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
  ];
}

// ---------- Statics ----------
function getStaticsEmbed(channelId = null) {
  const embed = new EmbedBuilder()
    .setTitle("📌 Estática T7 - Selección de Roles")
    .setColor("#00AEEF")
    .setDescription("Selecciona tu rol para la Estática.")
    .addFields(
      { name: "🛡️ TANK (1)", value: staticsRoles.tank.length ? staticsRoles.tank.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "✨ HEALER (1)", value: staticsRoles.healer.length ? staticsRoles.healer.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "🔥 FLAMIGERO (1)", value: staticsRoles.flamigero.length ? staticsRoles.flamigero.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "⚔️ ROMPEREINOS (1)", value: staticsRoles.rompe.length ? staticsRoles.rompe.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "🌑 SHADOWCALLER (1)", value: staticsRoles.shadow.length ? staticsRoles.shadow.map(id => `<@${id}>`).join("\n") : "*Vacante*" }
    );
  if (channelId) embed.addFields({ name: "🔊 Canal de voz", value: `<#${channelId}>` });
  return embed;
}

function getStaticsButtons(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("tank_s").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || staticsRoles.tank.length >= ROLE_LIMIT.tank),
      new ButtonBuilder().setCustomId("healer_s").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || staticsRoles.healer.length >= ROLE_LIMIT.healer),
      new ButtonBuilder().setCustomId("flamigero_s").setLabel("Flamigero").setStyle(ButtonStyle.Secondary).setDisabled(disabled || staticsRoles.flamigero.length >= ROLE_LIMIT.flamigero),
      new ButtonBuilder().setCustomId("rompe_s").setLabel("RompeReinos").setStyle(ButtonStyle.Danger).setDisabled(disabled || staticsRoles.rompe.length >= ROLE_LIMIT.rompe),
      new ButtonBuilder().setCustomId("shadow_s").setLabel("Shadowcaller").setStyle(ButtonStyle.Primary).setDisabled(disabled || staticsRoles.shadow.length >= ROLE_LIMIT.shadow)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cerrar_estatica").setLabel("🛑 Cerrar (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

// ---------- Grupales ----------
function getGrupalEmbed(channelId = null) {
  const embed = new EmbedBuilder()
    .setTitle("⚔️ Actividad Grupal - Selección de Roles")
    .setColor("#9b59b6")
    .setDescription("Selecciona tu rol para la actividad grupal.")
    .addFields(
      { name: "🛡️ TANK (1)", value: grupalRoles.tank.length ? grupalRoles.tank.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "✨ HEALER (1)", value: grupalRoles.healer.length ? grupalRoles.healer.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "🔥 FLAMIGERO (1)", value: grupalRoles.flamigero.length ? grupalRoles.flamigero.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "💎 PRISMA (1)", value: grupalRoles.prisma.length ? grupalRoles.prisma.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "🌑 SHADOWCALLER (1)", value: grupalRoles.shadow.length ? grupalRoles.shadow.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "⚡ BADON (1)", value: grupalRoles.badon.length ? grupalRoles.badon.map(id => `<@${id}>`).join("\n") : "*Vacante*" }
    );
  if (channelId) embed.addFields({ name: "🔊 Canal de voz", value: `<#${channelId}>` });
  return embed;
}

function getGrupalButtons(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("tank_g").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || grupalRoles.tank.length >= GRUPAL_LIMIT.tank),
      new ButtonBuilder().setCustomId("healer_g").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || grupalRoles.healer.length >= GRUPAL_LIMIT.healer),
      new ButtonBuilder().setCustomId("flamigero_g").setLabel("Flamigero").setStyle(ButtonStyle.Danger).setDisabled(disabled || grupalRoles.flamigero.length >= GRUPAL_LIMIT.flamigero)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("prisma_g").setLabel("Prisma").setStyle(ButtonStyle.Secondary).setDisabled(disabled || grupalRoles.prisma.length >= GRUPAL_LIMIT.prisma),
      new ButtonBuilder().setCustomId("shadow_g").setLabel("Shadowcaller").setStyle(ButtonStyle.Primary).setDisabled(disabled || grupalRoles.shadow.length >= GRUPAL_LIMIT.shadow),
      new ButtonBuilder().setCustomId("badon_g").setLabel("Badon").setStyle(ButtonStyle.Primary).setDisabled(disabled || grupalRoles.badon.length >= GRUPAL_LIMIT.badon)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cerrar_grupal").setLabel("🛑 Cerrar (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

// ---------- Dorados ----------
function getDoradosEmbed(channelId = null) {
  const embed = new EmbedBuilder()
    .setTitle("💛 DORADOS T7 BRACILEAN")
    .setColor("#f1c40f")
    .setDescription("Selecciona tu rol para la actividad Dorados.")
    .addFields(
      { name: "🛡️ TANK (1)", value: doradosRoles.tank.length ? doradosRoles.tank.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "✨ HEALER (1)", value: doradosRoles.healer.length ? doradosRoles.healer.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "⛔ MALDI / STOPPER (1)", value: doradosRoles.stopper.length ? doradosRoles.stopper.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "🔥 FLAMIGERO (1)", value: doradosRoles.flamigero.length ? doradosRoles.flamigero.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "🌫️ PERFORA NIEBLAS (3)", value: doradosRoles.perfora.length ? doradosRoles.perfora.map(id => `<@${id}>`).join("\n") : "*Vacante*" }
    );
  if (channelId) embed.addFields({ name: "🔊 Canal de voz", value: `<#${channelId}>` });
  return embed;
}

function getDoradosButtons(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("tank_d").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || doradosRoles.tank.length >= DORADOS_LIMIT.tank),
      new ButtonBuilder().setCustomId("healer_d").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || doradosRoles.healer.length >= DORADOS_LIMIT.healer),
      new ButtonBuilder().setCustomId("stopper_d").setLabel("Stopper").setStyle(ButtonStyle.Danger).setDisabled(disabled || doradosRoles.stopper.length >= DORADOS_LIMIT.stopper)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("flamigero_d").setLabel("Flamigero").setStyle(ButtonStyle.Secondary).setDisabled(disabled || doradosRoles.flamigero.length >= DORADOS_LIMIT.flamigero),
      new ButtonBuilder().setCustomId("perfora_d").setLabel("Perfora Nieblas").setStyle(ButtonStyle.Primary).setDisabled(disabled || doradosRoles.perfora.length >= DORADOS_LIMIT.perfora)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cerrar_dorados").setLabel("🛑 Cerrar (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

// ---------- Gank ----------
function getGankEmbed(channelId = null) {
  const embed = new EmbedBuilder()
    .setTitle("🔴 Gankeo T7")
    .setColor("#e74c3c")
    .setDescription("Selecciona tu rol para el Gank T7.")
    .addFields(
      { name: "🛡️ TANK (1)", value: gankRoles.tank.length ? gankRoles.tank.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "🪄 CC (1)", value: gankRoles.cc.length ? gankRoles.cc.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "✨ HEALER (1)", value: gankRoles.healer.length ? gankRoles.healer.map(id => `<@${id}>`).join("\n") : "*Vacante*" },
      { name: "⚔️ DPS (4)", value: gankRoles.dps.length ? gankRoles.dps.map(id => `<@${id}>`).join("\n") : "*Vacante*" }
    );
  if (channelId) embed.addFields({ name: "🔊 Canal de voz", value: `<#${channelId}>` });
  return embed;
}

function getGankButtons(disabled = false) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("tank_k").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || gankRoles.tank.length >= GANK_LIMIT.tank),
      new ButtonBuilder().setCustomId("cc_k").setLabel("CC").setStyle(ButtonStyle.Secondary).setDisabled(disabled || gankRoles.cc.length >= GANK_LIMIT.cc),
      new ButtonBuilder().setCustomId("healer_k").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || gankRoles.healer.length >= GANK_LIMIT.healer)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("dps_k").setLabel("DPS").setStyle(ButtonStyle.Danger).setDisabled(disabled || gankRoles.dps.length >= GANK_LIMIT.dps)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("cerrar_gank").setLabel("🛑 Cerrar (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
    )
  ];
}

// ------------------- Helpers: crear/eliminar canales de voz -------------------
async function createVoiceChannel(name, guild, referenceChannel) {
  try {
    const createOptions = {
      name,
      type: ChannelType.GuildVoice
    };
    // mantén la categoría si existe
    if (referenceChannel && referenceChannel.parentId) createOptions.parent = referenceChannel.parentId;

    const vc = await guild.channels.create(createOptions);
    return vc;
  } catch (err) {
    console.error("Error creando canal de voz:", err?.message || err);
    return null;
  }
}

async function deleteVoiceChannel(channelId, guild) {
  if (!channelId) return;
  const ch = guild.channels.cache.get(channelId);
  if (!ch) return;
  try {
    await ch.delete();
  } catch (err) {
    // evitar crash
    console.error("No se pudo eliminar canal de voz:", err?.message || err);
  }
}

// ------------------- Eventos -------------------
client.on("ready", () => {
  console.log(`Bot iniciado como ${client.user.tag}`);
});

// ---------- Comando de despliegue del menú ----------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!setupactivities") {
    // Si AUTO_PING_CHANNEL_ID está definido, restringe el comando a ese canal.
    if (AUTO_PING_CHANNEL_ID && message.channel.id !== AUTO_PING_CHANNEL_ID) return;

    try {
      await message.channel.send({ embeds: [getMainMenuEmbed()], components: getMainMenuButtons() });
    } catch (err) {
      console.error("Error enviando menú principal:", err?.message || err);
    }
  }
});

// ---------- Interacciones (botones) ----------
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // obtén canal de actividades
  const activitiesChannel = interaction.guild.channels.cache.get(ACTIVITIES_CHANNEL_ID);
  if (!activitiesChannel) {
    return interaction.reply({ content: "No se encontró el canal de actividades. Comprueba ACTIVITIES_CHANNEL_ID.", ephemeral: true });
  }

  // ---------- CREAR ESTÁTICA ----------
  if (interaction.customId === "actividad_estaticas") {
    staticsRoles = { tank: [], healer: [], flamigero: [], rompe: [], shadow: [] };
    const vc = await createVoiceChannel("Estática T7 - Voz", interaction.guild, activitiesChannel);
    staticsVoiceChannelId = vc ? vc.id : null;
    try {
      await activitiesChannel.send({ content: "@here **Estática T7**", embeds: [getStaticsEmbed(staticsVoiceChannelId)], components: getStaticsButtons() });
      await interaction.reply({ content: "Estática creada.", ephemeral: true });
    } catch (err) {
      console.error("Error al crear Estática:", err?.message || err);
      return interaction.reply({ content: "Error creando la Estática.", ephemeral: true });
    }
    return;
  }

  // CERRAR ESTÁTICA
  if (interaction.customId === "cerrar_estatica") {
    if (!CALLER_ROLE || !interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) {
      return interaction.reply({ content: "❌ Solo CALLER puede cerrar esta actividad.", ephemeral: true });
    }
    try {
      await interaction.update({ content: "🛑 Actividad Estática cerrada.", embeds: [getStaticsEmbed(staticsVoiceChannelId)], components: getStaticsButtons(true) });
      await deleteVoiceChannel(staticsVoiceChannelId, interaction.guild);
      staticsVoiceChannelId = null;
    } catch (err) {
      console.error("Error cerrando Estática:", err?.message || err);
      return interaction.reply({ content: "Error cerrando la Estática.", ephemeral: true });
    }
    return;
  }

  // INSCRIPCIÓN EN ESTÁTICA (roles)
  if (staticsMap[interaction.customId]) {
    const rol = staticsMap[interaction.customId];
    const user = interaction.user.id;
    if (staticsRoles[rol].includes(user)) {
      // si ya estaba inscrito, lo quitamos (toggle)
      staticsRoles[rol] = staticsRoles[rol].filter(id => id !== user);
    } else {
      if (staticsRoles[rol].length >= ROLE_LIMIT[rol]) {
        return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
      }
      // quitar al usuario de otros roles de esta actividad (1 rol por usuario)
      for (const r in staticsRoles) staticsRoles[r] = staticsRoles[r].filter(id => id !== user);
      staticsRoles[rol].push(user);
    }
    return interaction.update({ embeds: [getStaticsEmbed(staticsVoiceChannelId)], components: getStaticsButtons() });
  }

  // ---------- CREAR GRUPAL ----------
  if (interaction.customId === "actividad_grupales") {
    grupalRoles = { tank: [], healer: [], flamigero: [], prisma: [], shadow: [], badon: [] };
    const vc = await createVoiceChannel("Grupal - Voz", interaction.guild, activitiesChannel);
    grupalVoiceChannelId = vc ? vc.id : null;
    try {
      await activitiesChannel.send({ content: "@here **Actividad Grupal**", embeds: [getGrupalEmbed(grupalVoiceChannelId)], components: getGrupalButtons() });
      await interaction.reply({ content: "Actividad grupal creada.", ephemeral: true });
    } catch (err) {
      console.error("Error creando actividad grupal:", err?.message || err);
      return interaction.reply({ content: "Error creando la actividad grupal.", ephemeral: true });
    }
    return;
  }

  // CERRAR GRUPAL
  if (interaction.customId === "cerrar_grupal") {
    if (!CALLER_ROLE || !interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) {
      return interaction.reply({ content: "❌ Solo CALLER puede cerrar esta actividad.", ephemeral: true });
    }
    try {
      await interaction.update({ content: "🛑 Actividad Grupal cerrada.", embeds: [getGrupalEmbed(grupalVoiceChannelId)], components: getGrupalButtons(true) });
      await deleteVoiceChannel(grupalVoiceChannelId, interaction.guild);
      grupalVoiceChannelId = null;
    } catch (err) {
      console.error("Error cerrando grupal:", err?.message || err);
      return interaction.reply({ content: "Error cerrando la actividad grupal.", ephemeral: true });
    }
    return;
  }

  // INSCRIPCIÓN EN GRUPAL
  if (grupalMap[interaction.customId]) {
    const rol = grupalMap[interaction.customId];
    const user = interaction.user.id;
    if (grupalRoles[rol].includes(user)) {
      grupalRoles[rol] = grupalRoles[rol].filter(id => id !== user);
    } else {
      if (grupalRoles[rol].length >= GRUPAL_LIMIT[rol]) {
        return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
      }
      for (const r in grupalRoles) grupalRoles[r] = grupalRoles[r].filter(id => id !== user);
      grupalRoles[rol].push(user);
    }
    return interaction.update({ embeds: [getGrupalEmbed(grupalVoiceChannelId)], components: getGrupalButtons() });
  }

  // ---------- CREAR DORADOS ----------
  if (interaction.customId === "actividad_dorados") {
    doradosRoles = { tank: [], healer: [], stopper: [], flamigero: [], perfora: [] };
    const vc = await createVoiceChannel("Dorados T7 - Voz", interaction.guild, activitiesChannel);
    doradosVoiceChannelId = vc ? vc.id : null;
    try {
      await activitiesChannel.send({ content: "@here **💛 DORADOS T7 BRACILEAN**", embeds: [getDoradosEmbed(doradosVoiceChannelId)], components: getDoradosButtons() });
      await interaction.reply({ content: "Actividad Dorados creada.", ephemeral: true });
    } catch (err) {
      console.error("Error creando Dorados:", err?.message || err);
      return interaction.reply({ content: "Error creando la actividad Dorados.", ephemeral: true });
    }
    return;
  }

  // CERRAR DORADOS
  if (interaction.customId === "cerrar_dorados") {
    if (!CALLER_ROLE || !interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) {
      return interaction.reply({ content: "❌ Solo CALLER puede cerrar esta actividad.", ephemeral: true });
    }
    try {
      await interaction.update({ content: "🛑 Actividad Dorados cerrada.", embeds: [getDoradosEmbed(doradosVoiceChannelId)], components: getDoradosButtons(true) });
      await deleteVoiceChannel(doradosVoiceChannelId, interaction.guild);
      doradosVoiceChannelId = null;
    } catch (err) {
      console.error("Error cerrando Dorados:", err?.message || err);
      return interaction.reply({ content: "Error cerrando la actividad Dorados.", ephemeral: true });
    }
    return;
  }

  // INSCRIPCIÓN EN DORADOS
  if (doradosMap[interaction.customId]) {
    const rol = doradosMap[interaction.customId];
    const user = interaction.user.id;
    if (doradosRoles[rol].includes(user)) {
      doradosRoles[rol] = doradosRoles[rol].filter(id => id !== user);
    } else {
      if (doradosRoles[rol].length >= DORADOS_LIMIT[rol]) {
        return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
      }
      for (const r in doradosRoles) doradosRoles[r] = doradosRoles[r].filter(id => id !== user);
      doradosRoles[rol].push(user);
    }
    return interaction.update({ embeds: [getDoradosEmbed(doradosVoiceChannelId)], components: getDoradosButtons() });
  }

  // ---------- CREAR GANK ----------
  if (interaction.customId === "actividad_gank") {
    gankRoles = { tank: [], cc: [], healer: [], dps: [] };
    const vc = await createVoiceChannel("Gankeo T7 - Voz", interaction.guild, activitiesChannel);
    gankVoiceChannelId = vc ? vc.id : null;
    try {
      await activitiesChannel.send({ content: "@here **🔴 Gankeo T7**", embeds: [getGankEmbed(gankVoiceChannelId)], components: getGankButtons() });
      await interaction.reply({ content: "Actividad Gank creada.", ephemeral: true });
    } catch (err) {
      console.error("Error creando Gank:", err?.message || err);
      return interaction.reply({ content: "Error creando la actividad Gank.", ephemeral: true });
    }
    return;
  }

  // CERRAR GANK
  if (interaction.customId === "cerrar_gank") {
    if (!CALLER_ROLE || !interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) {
      return interaction.reply({ content: "❌ Solo CALLER puede cerrar la actividad.", ephemeral: true });
    }
    try {
      await interaction.update({ content: "🛑 Actividad Gank cerrada.", embeds: [getGankEmbed(gankVoiceChannelId)], components: getGankButtons(true) });
      await deleteVoiceChannel(gankVoiceChannelId, interaction.guild);
      gankVoiceChannelId = null;
    } catch (err) {
      console.error("Error cerrando Gank:", err?.message || err);
      return interaction.reply({ content: "Error cerrando la actividad Gank.", ephemeral: true });
    }
    return;
  }

  // INSCRIPCIÓN EN GANK
  if (gankMap[interaction.customId]) {
    const rol = gankMap[interaction.customId];
    const user = interaction.user.id;
    if (gankRoles[rol].includes(user)) {
      gankRoles[rol] = gankRoles[rol].filter(id => id !== user);
    } else {
      if (gankRoles[rol].length >= GANK_LIMIT[rol]) {
        return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
      }
      for (const r in gankRoles) gankRoles[r] = gankRoles[r].filter(id => id !== user);
      gankRoles[rol].push(user);
    }
    return interaction.update({ embeds: [getGankEmbed(gankVoiceChannelId)], components: getGankButtons() });
  }
});

// ------------------- Login -------------------
if (!BOT2_TOKEN) {
  console.error("Falta BOT2_TOKEN en las variables de entorno. No se puede iniciar.");
  process.exit(1);
}

client.login(BOT2_TOKEN).catch(err => {
  console.error("Error iniciando sesión:", err?.message || err);
  process.exit(1);
});
