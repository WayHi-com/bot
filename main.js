const Discord = require('discord.js');
const client = new Discord.Client();

const CREATE_CHANNEL_NAME = '🎮-start-here'
const LOBBY_CHANNEL_NAME = '🎮 | Create a lobby'
const LOBBY_CATEGORY_NAME = 'Game Lobbies'

fs = require('fs')


clickedUsers = []
createdChannels = []

//emodziLimits = {}
emodziLimits = require('./emodzilimits.json');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

prefix = '/cc'
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	if (!message.member.hasPermission('ADMINISTRATOR')) {
		console.log('Not admin')
		return
	}

	//message.delete(1000)

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	console.log(command)
	console.log(args)
	console.log(args.length)
	if (command === 'setemodzilimit' && args.length == 2) {
		limit = parseInt(args[1])
		if (!limit) {return}

		emodziLimits[args[0]] = limit
		message.channel.send(`Limit for reacton '${args[0]}' is set for ${limit}`)
		.then(msg => {
			setTimeout(function() {
				msg.delete()
			}, 10000)
		})
		.catch(error => { throw error});
		console.log(emodziLimits)

		fs.writeFileSync('emodzilimits.json', JSON.stringify(emodziLimits));
	}

	setTimeout(function() {
		message.delete()		
	}, 1000)
});


/*
client.on('messageReactionAdd', (reaction, user) => {
	if (reaction.message.channel.id != createchannel.id) return;

	createChannel(reaction.emoji.name, reaction.message.guild)
});
*/

/*
client.on('voiceStateUpdate', (oldMember, newMember) => {
	let lobbychannel = client.channels.cache.find(
		channel => channel.name.toLowerCase() === LOBBY_CHANNEL_NAME
	)

	console.log(newMember.voiceStates)	
	const newUserChannel = newMember.voice.channelID
  	const oldUserChannel = oldMember.voice.channelID
	//let newUserChannel = newMember ? newMember.voice.channel : null
	//let oldUserChannel = oldMember ? oldMember.voice.channel : null
	
  
	if (oldUserChannel === undefined && newUserChannel !== undefined) {  
		console.log('User Joins a voice channel')
	} else if(newUserChannel === undefined && newUserChannel == lobbychannel) {  
		console.log('User leaves a voice channel')  
	}
})
*/

client.on("ready", function(){
	let createchannel = client.channels.cache.find(
		channel => channel.name === CREATE_CHANNEL_NAME
	)
	let lobbychannel = client.channels.cache.find(
		channel => channel.name === LOBBY_CHANNEL_NAME
	)

	
	createchannel.messages.fetch({ limit: 100 }).then(messages => {
		console.log(`Received ${messages.size} messages`);
		//Iterate through the messages here with the variable "messages".
		messages.forEach(function(message) {			
			const filter = (reaction, user) => {
				return true
				//return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
			};

			let collector = message.createReactionCollector(filter, { time: 86400 * 9999 });
			collector.on('collect', async (reaction, user) => {
				reaction.users.remove(user);

				channelName = reaction.emoji.name
				guild = reaction.message.guild

				savedUser = clickedUsers.find(x => x.id == user.id)
				
				clickedAgo = savedUser ? (Date.now() - savedUser.lastClicked) / 1000 : 25
				if(clickedAgo < 25) {					
					await createchannel.send(`${user.toString()}, can create again only in ${Math.round(25 - clickedAgo)} seconds`)
						.then(msg => {
							setTimeout(function() {
								msg.delete()
							}, 10000)
						})
						.catch(error => { throw error});
					return
				}
				if (!guild.member(user).voice.channel || guild.member(user).voice.channel.name != lobbychannel.name) {
					await createchannel.send(`${user.toString()}, you must be in "${LOBBY_CHANNEL_NAME}" voice channel`)
					//await reaction.message.reply(`${user.toString()}, you must be in lobby voice channel`)
						.then(msg => {
							setTimeout(function() {
								msg.delete()
							}, 10000)
						})
						.catch(error => { throw error});
					return
				}
				alreadyCreated = false
				createdChannels.forEach(function(channel, index) {
					if (channel._userCreated == user) {
						createchannel.send(`${user.toString()}, you already created a lobby`)
						//await reaction.message.reply(`${user.toString()}, you must be in lobby voice channel`)
							.then(msg => {
								setTimeout(function() {
									msg.delete()
								}, 10000)
							})
							.catch(error => { throw error});
						alreadyCreated = true
					}
				})
				if (alreadyCreated) return
				//console.log(lobbychannel.guild.members.cache.first().id == user.id)

				
				user.lastClicked = Date.now()
				clickedUsers.push(user)

				
	
				//message.reply(reaction.emoji.name)
				//createChannel(reaction.emoji.name, reaction.message.guild)
				category = client.channels.cache.filter(x => x.name == LOBBY_CATEGORY_NAME).first()
				//channel.setParent(category.id);
								
				
				guild.channels.create(channelName, {
					type: "voice", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
					parent: category,
					parentID: category.id,
					permissionOverwrites: [
						{
							id: guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
							allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'], //Allow permissions
							deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] //Deny permissions
						}
					],
				}).then(function(channel) {		
					console.log(channelName)
					if(channel.name in emodziLimits) {
						limit = emodziLimits[channelName]
					} else {
						limit = 5
					}
					channel.setUserLimit(limit)
					
					channel._userCreated = user	
					createdChannels.push(channel)

					lobbychannel.members.forEach(function(member, index) {
						member.voice.setChannel(channel)
					})

					//guild.member(user).voice.setChannel(channel)

					//channel.setParent(category)
				}).catch(error => {throw error})
			});
			collector.on('end', collected => {
				console.log(`collected ${collected.size} reactions`);
			});
			

		})
	})

	//delete empty voice channels 
	setInterval(function() {
		createdChannels.forEach(function(channel, index, object) {
			if (channel.members.size == 0) {
				channel.delete()
				object.splice(index, 1)
			}
		})
		console.log(createdChannels.length)
	}, 10000)
})

//client.login('ODQxNTUxNDkzMTI3MzQwMDUy.YJoZ5w.FIEJaHFQonI04lf0f1beNd8zSKY');


//bot test
client.login('ODQyNjI2NzQ4MzY1MTQ0MDk0.YJ4DUA.-7-v_Re2KNfqBZqgssah2OOdT8g');
