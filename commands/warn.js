const { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const Database = require('../Schemas/infractions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warns a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false)
        .addUserOption(options =>
            options
            .setName('target')
            .setDescription('Select the target user')
            .setRequired(true))
        .addStringOption(option => 
            option
            .setName('reason')
            .setDescription('Provide a reason for this warn')
            .setMaxLength(512)),
        /** 
         * 
         * 
         * @param {ChatInputCommandInteraction} interaction
        */
        
        async execute (interaction){
            const { options, guild, member} = interaction;

            const target = options.getMember('target');
            const usuario = target.user.username + '#' + target.user.discriminator;
            const reason = options.getString('reason') ?? 'No reason provided';

            const errorsArray = [];

            const errorsEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Could not warn user due to' })
                .setColor('Red');

            if(!target) return interaction.reply({
                embeds: [errorsEmbed.setDescription('The specified memeber could not be found')],
                ephemeral: true
            });

            if(!target.manageable || !target.moderatable)
            errorsArray.push('The selected user is not moderatable');

            if(member.roles.highest.position < target.roles.highest.position)
            errorsArray.push('The selected has a higher role than you');

            const newInfractionsObject = {
                IssuerID: member.id,
                IssuerTag: member.user.tag,
                Reason: reason,
                Date: Date.now(),
            }

            let userData = await Database.findOne({Guild: guild.id, User: target.id, UserTag: usuario});
            if(!userData) 
            userData = await Database.create({ Guild: guild.id, User: target.id, UserTag: usuario, Infractions: [newInfractionsObject]});
            else
            userData.Infractions.push(newInfractionsObject) && await userData.save();

            const successEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Warn issued', iconURL: guild.iconURL() })
                .setColor('Gold')
                .setDescription([
                    `***${target}*** was issued a warn by ***${member}***`,
                    `bringing their total infractions to ***${userData.Infractions.length}***`,
                    `\nReason: ${reason}`
                ].join('\n'));

                return interaction.reply({ embeds: [successEmbed] });
        }
}
