const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Variables desde Railway
const AUTO_PING_CHANNEL_ID = process.env.AUTO_PING_CHANNEL_ID;
const ACTIVITIES_CHANNEL_ID = process.env.ACTIVITIES_CHANNEL_ID;
const CALLER_ROLE = process.env.CALLER_ROLE;

let staticsRoles = {
    tank: [],
    healer: [],
    flamigero: [],
    rompe: [],
    shadow: []
};

const ROLE_LIMIT = {
    tank: 1,
    healer: 1,
    flamigero: 1,
    rompe: 1,
    shadow: 1
};

function getStaticsEmbed() {
    return new EmbedBuilder()
        .setTitle("📌 Estática T7 - Selección de Roles")
        .setColor("#00AEEF")
        .setDescription("Selecciona tu rol para la actividad.")
        .addFields(
            { name: "🛡️ TANK (1)", value: `${staticsRoles.tank.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
            { name: "✨ HEALER (1)", value: `${staticsRoles.healer.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
            { name: "🔥 FLAMIGERO (1)", value: `${staticsRoles.azufre.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
            { name: "⚔️ ROMPE (1)", value: `${staticsRoles.rompe.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` },
            { name: "🌑 SHADOWCALLER (1)", value: `${staticsRoles.shadow.map(id => `<@${id}>`).join("\n") || "*Vacante*"}` }
        )
        .setTimestamp();
}

function getStaticsButtons(disabled = false) {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("tank").setLabel("Tank").setStyle(ButtonStyle.Primary).setDisabled(disabled || staticsRoles.tank.length >= 1),
            new ButtonBuilder().setCustomId("healer").setLabel("Healer").setStyle(ButtonStyle.Success).setDisabled(disabled || staticsRoles.healer.length >= 1),
            new ButtonBuilder().setCustomId("azufre").setLabel("Flamigero").setStyle(ButtonStyle.Secondary).setDisabled(disabled || staticsRoles.azufre.length >= 1),
            new ButtonBuilder().setCustomId("rompe").setLabel("RompeReinos").setStyle(ButtonStyle.Danger).setDisabled(disabled || staticsRoles.rompe.length >= 1),
            new ButtonBuilder().setCustomId("shadow").setLabel("ShadowCaller").setStyle(ButtonStyle.Primary).setDisabled(disabled || staticsRoles.shadow.length >= 1)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("cerrar").setLabel("🛑 Cerrar Actividad (CALLER)").setStyle(ButtonStyle.Danger).setDisabled(disabled)
        )
    ];
}

client.on("ready", () => {
    console.log(`Bot iniciado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.content === "!setupactivities") {
        if (message.channel.id !== AUTO_PING_CHANNEL_ID) return;

        const embed = new EmbedBuilder()
            .setTitle("📢 Selecciona el tipo de Actividad")
            .setColor("#2ecc71")
            .setDescription("Elige la actividad que deseas crear:")
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("actividad_grupales").setLabel("Grupales").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("actividad_estaticas").setLabel("Estáticas").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("actividad_gankeo").setLabel("Gankeo").setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({ embeds: [embed], components: [buttons] });
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;

    const activitiesChannel = interaction.guild.channels.cache.get(ACTIVITIES_CHANNEL_ID);
    if (!activitiesChannel)
        return interaction.reply({ content: "No se encontró el canal de actividades.", ephemeral: true });

    if (interaction.customId === "actividad_estaticas") {
        staticsRoles = { tank: [], healer: [], azufre: [], rompe: [], shadow: [] };

        await activitiesChannel.send({
            content: "@here @everyone **Estática T7**",
            embeds: [getStaticsEmbed()],
            components: getStaticsButtons()
        });

        return interaction.reply({ content: "Estática creada.", ephemeral: true });
    }

    if (interaction.customId === "cerrar") {
        if (!interaction.member.roles.cache.some(r => r.name === CALLER_ROLE)) {
            return interaction.reply({
                content: "❌ Solo el rol CALLER puede cerrar esta actividad.",
                ephemeral: true
            });
        }

        return interaction.update({
            content: "🛑 Actividad cerrada por CALLER.",
            embeds: [getStaticsEmbed()],
            components: getStaticsButtons(true)
        });
    }

    const roleMap = {
        tank: "tank",
        healer: "healer",
        flamigero: "azufre",
        rompe: "rompe",
        shadow: "shadow"
    };

    if (roleMap[interaction.customId]) {
        const rol = roleMap[interaction.customId];
        const user = interaction.user.id;

        if (staticsRoles[rol].length >= ROLE_LIMIT[rol]) {
            return interaction.reply({ content: "❌ Este rol ya está lleno.", ephemeral: true });
        }

        for (const r in staticsRoles) {
            staticsRoles[r] = staticsRoles[r].filter(id => id !== user);
        }

        staticsRoles[rol].push(user);

        return interaction.update({
            embeds: [getStaticsEmbed()],
            components: getStaticsButtons()
        });
    }
});

client.login(process.env.BOT2_TOKEN);
