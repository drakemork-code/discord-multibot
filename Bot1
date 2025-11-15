const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Variables desde Railway
const LOBBY_CHANNEL_ID = process.env.LOBBY_CHANNEL_ID;
const MEMBERS_ROLE_ID = process.env.MEMBERS_ROLE_ID;
const CATEGORY_ID = process.env.CATEGORY_ID;
const TEMP_PREFIX = "Temp-";

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (!oldState.channelId && newState.channelId === LOBBY_CHANNEL_ID) {

    const guild = newState.guild;
    const member = newState.member;

    const tempChannel = await guild.channels.create({
      name: `${TEMP_PREFIX}${member.user.username}`,
      type: 2,
      parent: CATEGORY_ID,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.Connect]
        },
        {
          id: MEMBERS_ROLE_ID,
          allow: [PermissionsBitField.Flags.Connect]
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.ManageChannels
          ]
        }
      ]
    });

    await member.voice.setChannel(tempChannel);
  }

  if (oldState.channel && oldState.channel.name.startsWith(TEMP_PREFIX)) {
    if (oldState.channel.members.size === 0) {
      oldState.channel.delete().catch(() => {});
    }
  }
});

client.once("ready", () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.login(process.env.BOT1_TOKEN);
