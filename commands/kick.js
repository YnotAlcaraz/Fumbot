const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Select a member and kicks them.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to kick')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('The reason for kicking'))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setDMPermission(false),
	async execute(interaction) {
		const { options, guild, member} = interaction;
		const target = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';
		const errorsArray = [];

		const errorsEmbed = new EmbedBuilder()
			.setAuthor({ name: 'Could not kick user', iconURL: guild.iconURL() })
			.setColor('Red');
		
		const SuccessEmbed = new EmbedBuilder()
			.setAuthor({ name: 'User kicked', iconURL: guild.iconURL() })
			.setColor('Gold')
			.setDescription(
				`***${target.tag}***  has been kicked for ***${reason}***`
			);

			if(!target.manageable || !target.moderatable)
            errorsArray.push('The selected user is not moderatable');

            if(errorsArray.length)
            return interaction.reply({
                embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
                ephemeral: true
            });

			interaction.guild.members.kick(target).catch(err =>{
				interaction.reply({ embeds: [errorsEmbed] })
				return console.log('Error en kick.js', err)
			});

			return interaction.reply({ embeds: [SuccessEmbed]});

		/*if(await interaction.guild.members.kick(target)){
			await interaction.reply(`***${target.tag}*** has been kicked for ***${reason}***`);
		} else {
			await interaction.reply(`${target.tag} couldn't be kicked.\nPlease check both my and your permissions`);
		}*/
	},
};
