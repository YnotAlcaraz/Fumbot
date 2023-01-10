const { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const Database = require('../Schemas/infractions');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Restricts a member ability to send messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false)
        .addUserOption(options =>
            options
            .setName('target')
            .setDescription('Select the target user')
            .setRequired(true))
        .addStringOption(option => 
            option
            .setName('duration')
            .setDescription('Provide a duration for the timeout (1m/1h/1d)')
            .setRequired(true))
        .addStringOption(option => 
            option
            .setName('reason')
            .setDescription('Provide a reason for this timeout')
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
            const duration = options.getString('duration');
            const reason = options.getString('reason') ?? 'No reason provided';

            const errorsArray = [];

            const errorsEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Could not timeout user due to' })
                .setColor('Red');

            if(!target) return interaction.reply({
                embeds: [errorsEmbed.setDescription('The specified memeber could not be found')],
                ephemeral: true
            });

            if(!ms(duration) || ms (duration) > ms('28d'))
            errorsArray.push('The time provided is not valid or is over the 28 days limit');

            if(!target.manageable || !target.moderatable)
            errorsArray.push('The selected user is not moderatable');


            if(member.roles.highest.position < target.roles.highest.position)
            errorsArray.push('The selected has a higher role than you');

            if(errorsArray.length)
            return interaction.reply({
                embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
                ephemeral: true
            });

            target.timeout(ms(duration), reason).catch(err => {
                interaction.reply({
                    embeds: [errorsEmbed.setDescription('Could not timeout the user to an uncommon error')]
                })
                return console.log('Error puñetas en timeout.js lptm', err);
            });

            const newInfractionsObject = {
                IssuerID: member.id,
                IssuerTag: member.user.tag,
                Reason: reason,
                Date: Date.now(),
            }

            let userData = await Database.findOne({Guild: guild.id, User: target.id, UserTag: usuario});
            if(!userData) 
            userData = await Database.create({ Guild: guild.id, User: target.id, UserTag: usuario,Infractions: [newInfractionsObject]});
            else
            userData.Infractions.push(newInfractionsObject) && await userData.save();

            const successEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Timeout issued', iconURL: guild.iconURL() })
                .setColor('Gold')
                .setDescription([
                    `***${target}*** was issued a timeout for ***${ms(ms(duration), {long: true})}*** by ***${member}***`,
                    `bringing their total infractions to ***${userData.Infractions.length}***`,
                    `\nReason: ${reason}`
                ].join('\n'));

                return interaction.reply({ embeds: [successEmbed] });
        }
}
