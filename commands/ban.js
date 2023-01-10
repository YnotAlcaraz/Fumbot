const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Select a member and bans them.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to ban')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for banning'))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setDMPermission(false),
	async execute(interaction) {
		const guild = interaction;
		const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';
		const errorsArray = [];

		const errorsEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Could not ban user', iconURL: guild.iconURL() })
			.setColor('Red');
		
		const SuccessEmbed = new EmbedBuilder()
			.setAuthor({ name: 'User banned', iconURL: guild.iconURL() })
			.setColor('Gold')
			.setDescription(
				`***${target.tag}***  has been banned for ***${reason}***`
			);

			if(!target.manageable || !target.moderatable)
            errorsArray.push('The selected user is not moderatable');

            if(errorsArray.length)
            return interaction.reply({
                embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
                ephemeral: true
            });

			interaction.guild.members.ban(target).catch(err =>{
				interaction.reply({ embeds: [errorsEmbed] })
				return console.log('Error puñetas en ban.js lptm', err)
			});

			return interaction.reply({ embeds: [SuccessEmbed]});

		/*if(await interaction.guild.members.kick(target)){
			await interaction.reply(`***${target.tag}*** has been kicked for ***${reason}***`);
		} else {
			await interaction.reply(`${target.tag} couldn't be kicked.\nPlease check both my and your permissions`);
		}*/
	},
};