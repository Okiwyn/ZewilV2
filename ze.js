const Discord = require("discord.js");
const { PREFIX } = require("./config");
const ytdl = require("ytdl-core");

const client = new Discord.Client();

const queue = new Map();

client.on('warn', console.warn);
client.on('error', console.error);
client.on('ready', () => console.log('Sunt pornit!'));

client.on('message', async msg => {
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;
    const args = msg.content.split(' ');
    const serverQueue = queue.get(msg.guild.id);

    if (msg.content.startsWith(`${PREFIX}play`)) {

        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.reply(':x: You need to be in a voice channel! :x:');
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT')) {
            return msg.reply(":x: I can't join the voice channel. :x:\n Missing Permissions : `CONNECT`");
        }
        if (!permissions.has('SPEAK')) {
            return msg.reply(":x: I can't speak in this voice channel. :x:\n Missing Permissions : `SPEAK`");
        }

        const songInfo = await ytdl.getInfo(args[1]);
        const song = {
            title: songInfo.title,
            url: songInfo.video_url
        };

        if (!serverQueue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            queue.set(msg.guild.id, queueConstruct);

            queueConstruct.songs.push(song);
            
            try {
                var connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(msg.guild, queueConstruct.songs[0]);
            } catch (error) {
                console.error(`:x: A problem just arived. Error : ${error}`);
                queue.delete(msg.guild.id);
                return msg.channel.send(`:x: I can\'t join the voice channel. :x:\n Error : **${error}**`);
            }
        } else {

            serverQueue.songs.push(song);
            console.log(serverQueue.songs);

            msg.channel.send(`**${msg.author.tag}** has added the song **${song.title}**.\n\n Have a great time with the music!`);
        }
        return undefined;

    } else if (msg.content.startsWith(`${PREFIX}skip`)) {
        if (serverQueue) { 
        if (!serverQueue) msg.reply(":x: There is nothing playing! :x:");
        serverQueue.connection.dispatcher.end();
        return undefined;
    
    } else if (msg.content.startsWith(`${PREFIX}np`)) {

		if (!serverQueue) return msg.channel.send('There is nothing playing.');
        return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
        
    }
        
    } else if (msg.content.startsWith(`${PREFIX}stop`)) {
        if (!msg.member.voiceChannel) return msg.reply(':x: You need to be in a voice channel! :x:');
        msg.member.voiceChannel.leave();
        return undefined;
    
    } else if  (msg.content.startsWith(`${PREFIX}volume`)) {

        if (!serverQueue) return msg.reply(":x: There is nothing playing! :x:");
        if (!args[1]) return msg.reply(`The current volume is: **${serverQueue.volume}**.`);
        if (args[1] > 30) return msg.reply(`The volume must be smaller than **30**.`);
        if (!msg.member.hasPermission(`MANAGE_CHANNELS`)) return msg.reply(":x: You don't have the proper permissions to use this command. :x:\n Missing Permissions : `MANAGE_SERVERS`");
        serverQueue.volume = args[1]
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
        return msg.channel.send(`The volume is now: **${args[1]}**.`);

    } else if (msg.content.startsWith(`${PREFIX}queue`)) {

        if (!serverQueue) return msg.channel.send('There is nothing playing.');
        
		return msg.channel.send(`
__**:musical_note: Song queue:**__

${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}

**:musical_note: Now playing:** ${serverQueue.songs[0].title}
		`);

    return undefined;
    }
});

function play(guild, song) {
    const serverQueue = queue.get(guild.id);

    if(!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on(`end`, () => {
        console.log('Melodia s-a terminat.');
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    })
    .on(`error`, () => console.error(error));
  dispatcher.setVolumeLogarithmic(5 / 5);

  serverQueue.textChannel.send(`🎶 Start playing: **${song.title}**`);
}

client.login(process.env.BOT_TOKEN);
