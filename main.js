const Discord = require('discord.js');
const client = new Discord.Client();

const CREATE_CHANNEL_NAME = 'create-channel'

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
	if (message.content === 'ping') {
		message.reply('pong');
		channelName = 'test'		
	}
	//message.react('👍').then(() => message.react('👎')); 
});


client.on("ready", function(){
	let createchannel = client.channels.cache.find(
		channel => channel.name.toLowerCase() === CREATE_CHANNEL_NAME
	)
	console.log(createchannel)

	createchannel.messages.fetch({ limit: 100 }).then(messages => {
		console.log(`Received ${messages.size} messages`);
		//Iterate through the messages here with the variable "messages".
		messages.forEach(function(message) {			
			const filter = (reaction, user) => {
				return true
				//return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
			};
		
			message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(collected => {
					const reaction = collected.first();
					
					//message.reply(reaction.emoji.name)
					createChannel(reaction.emoji.name, message.guild)
				})
				.catch(collected => {
					
				});

		})
	  })

	  
})

function createChannel(channelName, guild) {
	guild.channels.create(channelName, {
		type: "voice", //This create a text channel, you can make a voice one too, by changing "text" to "voice"
		permissionOverwrites: [
			{
				id: guild.roles.everyone, //To make it be seen by a certain role, user an ID instead
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'], //Allow permissions
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] //Deny permissions
			}
		],
	})
}

client.login('ODQxNTUxNDkzMTI3MzQwMDUy.YJoZ5w.FIEJaHFQonI04lf0f1beNd8zSKY');


