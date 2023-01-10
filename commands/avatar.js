const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get the avatar URL of the selected user, or your own avatar.')
		.addUserOption(option => option.setName('target').setDescription('The user\'s avatar to show')),
	async execute(interaction) {
		const user = interaction.options.getUser('target');

		if(user){
			const embed = new EmbedBuilder()
			.setColor(0x18e1ee)
			.setImage(user.displayAvatarURL({
				size: 1024,
				dynamic: true
			}))
			.setAuthor({
				name: "Selected user's avatar"
			});
		await interaction.reply({
			embeds: [embed]
		});
		} else {
			const embed = new EmbedBuilder()
			.setColor(0x18e1ee)
			.setImage(interaction.user.displayAvatarURL({
				size: 1024,
				dynamic: true
			}))
			.setAuthor({
				name: "Your avatar"
			});
		await interaction.reply({
			embeds: [embed]
		});
		}
        
	},
};
