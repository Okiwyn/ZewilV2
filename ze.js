const Discord = require('discord.js');
const Util = require('discord.js');
const { TOKEN, PREFIX, YTB_KEY } = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

const youtube = new YouTube(YTB_KEY);

const queue = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => {
	console.log("Sunt pornit!");
	client.user.setPresence({ game: { name: 'with the sky | z)help', type: 1 } });
})

client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(PREFIX)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)

	if (command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue!`);

		} else {

			try {

				var video = await youtube.getVideo(url);
			} catch (error) {
				try {

					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;

					const selectEmbed = new Discord.RichEmbed()
					.setColor('RANDOM')
					.setAuthor('Song Selection')
					.setDescription(`${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n\n')}`)
					.setFooter('Provide a value to select one of the search results ranging from 1-10.');
					msg.channel.send(selectEmbed);

					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {

						const errorEmbed = new Discord.RichEmbed()
						.setColor('RANDOM')
						.setDescription(':x: No or invalid value entered, cancelling video selection. :x:');

						console.error(err);
						return msg.channel.send(errorEmbed);
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {

					const sosEmbed = new Discord.RichEmbed()
					.setColor('RANDOM')
					.setDescription(':x: I could not obtain any search results. :x:');

					console.error(err);
					return msg.channel.send(sosEmbed);
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'skip') {
		if (!msg.member.voiceChannel) return msg.channel.send(':x: You are not in a VoiceChannel. :x:');
		if (!serverQueue) return msg.channel.send(':x: There is nothing playing. :x:');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === 'stop') {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send(':x: There is nothing playing. :x:');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		return undefined;

	} else if (command === 'test') {
		
		const { Canvas } = require('canvas-constructor');
        new Canvas(300, 300)
        .setColor('#AEFD54')
        .addRect(5, 5, 290, 290)
        .setColor('#FFAE23')
        .setTextFont('28px Impact')
        .addText('Hello World!', 130, 150)
        .toBuffer();

	} else if (command === 'volume') {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send(':x: There is nothing playing. :x:');
		if (!args[1]) return msg.channel.send(`The current volume is: **${serverQueue.volume}**`);
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return msg.channel.send(`I set the volume to: **${args[1]}**`);
	} else if (command === 'np') {

		const npEmbed = new Discord.RichEmbed()
		.setColor('RANDOM')
		.setDescription(`:musical_note: Now Playing: **${serverQueue.songs[0].title}** :musical_note: `)
		.setFooter("Have fun with the music!");

		if (!serverQueue) return msg.channel.send(':x: There is nothing playing. :x:');
		return msg.channel.send(npEmbed);


	    if (command === `shit`) {
			const { Canvas } = require('canvas-constructor');
			if (message.mentions.users.size < 1) return message.channel.send("You didn't mention a user to put them behind bars");
		   const getSlapped = async (person) => {
			const plate = await fsn.readFile('https://imgur.com/gallery/K3OK8.png');
			const png = person.replace(/\.gif.+/g, '.png');
			const { body } = await snek.get(png);
			return new Canvas(250, 250)
			.resetTransformation()
			.addImage(body, 0, 0, 250, 250)
			.addImage(plate, 0, 0, 250, 250)
			.toBuffer();
			}
			
			const person = message.mentions.users.first().avatarURL;
			const result = await getSlapped(person);
			message.channel.send({ files: [{ attachment: result, name: 'dog.png' }] })
		}

	} else if (command === 'queue') {

		const queue2Embed = new Discord.RichEmbed()
		.setColor('RANDOM')
		.addField(':musical_note: Song Queue :musical_note:', `${serverQueue.songs.map(song => `- ${song.title}`).join('\n')}`)
		.addField(':musical_note: Now Playing :musical_note:', `${serverQueue.songs[0].title}`)
		.setFooter("Have fun with the music!");

		if (!serverQueue) return msg.channel.send(':x: There is nothing playing. :x:');
		return msg.channel.send(queue2Embed);

	} else if (command === 'pause') {

		const pauseEmbed = new Discord.RichEmbed()
		.setColor('RANDOM')
		.setDescription(`⏸ The song has been paused. ⏸`)
		.setFooter("Have fun with the music!");

		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send(pauseEmbed);
		}
		return msg.channel.send(':x: There is nothing playing. :x:');
	} else if (command === 'resume') {

		const resumeEmbed = new Discord.RichEmbed()
		.setColor('RANDOM')
		.setDescription(`▶ The song has been resumed. ▶`)
		.setFooter("Have fun with the music!");

		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send(resumeEmbed);
		}
		return msg.channel.send(':x: There is nothing playing. :x:');
	} else if (command === 'help') {

		const helpEmbed = new Discord.RichEmbed()
        .setColor("RANDOM")
		.setAuthor('Help?')
		.setDescription('Hi, I am Zewil! I am a simple music bot like the other ones. But, in the future, I will be able to do more things. Stay tuned!')
        .addField(":bulb: General commands", 
        "**`z)play`** - Plays a song.\n" + 
		"**`z)skip`** - Skips the current song that is playing.\n" +
		"**`z)volume`** - Changes the volume.\n" +
		"**`z)pause`** - Pauses the current song that is playing.\n" +
		"**`z)resume`** - Resumes the current song that has been paused.\n" +
		"**`z)np`** - See the song that is currently playing")

		msg.channel.send(helpEmbed);
	} else if (command === 'translate') {
		const translate = require('google-translate-api');

		if (args[0]) {
			let from_language = "auto" // default languages
			let to_language = "en" // default languages
			let tobe_translated = msg.content.slice(PREFIX.length + command.length + 1) // Getting the text
			if (args[0].startsWith("from:")) { // Checking if there is a from:language & to:language, this part is not optimized
				from_language = args[0].slice(5)
				tobe_translated = tobe_translated.slice(args[0].length + 1)
				if (args[1].startsWith("to:")) {
					to_language = args[1].slice(3)
					tobe_translated = tobe_translated.slice(args[1].length + 1) // cutting the from & to from the text
				}
			} else if (args[0].startsWith("to:")) { // Checking if there is a to:language & from:language, Yes I check 2 times :/
				to_language = args[0].slice(3)
				tobe_translated = tobe_translated.slice(args[0].length + 1)
				if (args[1].startsWith("from:")) {
					from_language = args[1].slice(5)
					tobe_translated = tobe_translated.slice(args[1].length + 1) // cutting the from & to from the text
				}
			}
			translate(tobe_translated, {
				from: from_language,
				to: to_language
			}).then(res => { // We translate the text
				from_language = res.from.language.iso
				if (res.from.text.value) tobe_translated = res.from.text.value
				final_text = res.text
				let translateembed = new Discord.RichEmbed()
					.setTitle("Translate") // Optionnal stuff
					.setColor(`0x3980b3`) // Optionnal stuff
					.setDescription("Bip Bip Boop\nThe internet magic is here") // Optionnal stuff
					.addField("`from: " + from_language + "`", "```" + tobe_translated + "```")
					.addField("`to: " + to_language + "`", "```" + final_text + "```")
					.setThumbnail("https://cdn.dribbble.com/users/1341307/screenshots/3641494/google_translate.gif") // Optionnal stuff
				msg.channel.send(translateembed)
			}).catch(err => {
				msg.channel.send(":x: Usage: `" + PREFIX + "translate [from:iso] [to:iso] <some text>` \nExample: ```" + PREFIX + "translate from:ro to:fr Salut, ce mai faci?```") // Yes, I used Romanian for my example. Do you have any problem?
			});
		} else {
			msg.channel.send(":x: Usage: `" + PREFIX + "translate [from:iso] [to:iso] <some text>` \nExample: ```" + PREFIX + "translate from:ro to:fr Salut, ce mai faci?```")
		}
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
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
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {

		const queueEmbed = new Discord.RichEmbed()
		.setColor('RANDOM')
		.setDescription(`:musical_note: The song **${song.title}** requested by **${msg.author.tag}** has been added to the queue. :musical_note: `)
		.setFooter("Have fun with the music!");

		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(queueEmbed);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	const startEmbed = new Discord.RichEmbed()
	.setColor('RANDOM')
	.setDescription(`:musical_note: Start Playing: **${song.title}** :musical_note: `)
	.setFooter("Have fun with the music!");

	serverQueue.textChannel.send(startEmbed);
}

client.login(TOKEN);