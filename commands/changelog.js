const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { saveChannelSetting, getChannelSettings } = require('../util/channelSettings');

async function handleAddChangelog(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channelId = getChannelSettings(interaction.guildId);
    if (!channelId) {
        // If no channel is set, inform the user to set one
        await interaction.editReply({
            content: "You have to select which channel you want to post to using /changelog setchannel <channel>"
        });
        return;
    }

    // Fetch the channel from the guild using the saved channel ID
    const channel = await interaction.guild.channels.fetch(channelId).catch(console.error);
    if (!channel) {
        await interaction.editReply({
            content: "The saved channel ID is no longer valid. Please set a new channel."
        });
        return;
    }


    const headline = interaction.options.getString('headline');
    let description = interaction.options.getString('description');
    description = description.replace(/\\n/g, '\n\n').replace(/~/g, '\n**~**\n');

    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle(`${headline}`)
        .setDescription(description)
        .addFields({ name: 'Posted at', value: `<t:${Math.floor(new Date().getTime() / 1000)}:F>`, inline: false });

    try {
        await channel.send({ embeds: [embed] });
        await interaction.editReply({ content: `Changelog has been posted successfully!` });
    } catch (error) {
        console.error("Failed to execute changelog add command:", error);
        await interaction.editReply({ content: "An error occurred while trying to execute the command." });
    }
}

async function handleSetChannel(interaction) {
    await interaction.deferReply({ ephemeral: true });

    //Issue to get interaction
    try {
        const channelOption = interaction.options.getChannel('channel');
        if (!channelOption) {
            throw new Error("No channel was selected or the channel does not exist.");
        }

        // Placeholder: Implement your method to save the channel settings
        saveChannelSetting(interaction.guildId, channelOption.id);

        await interaction.editReply({ content: `Changelog has been posted successfully!` });
    } catch (error) {
        console.error("Failed to execute changelog add command:", error);
        await interaction.editReply({ content: "An error occurred while trying to execute the command." });
    }
}


async function handleCheckChannel(interaction){
    try{
        const id = getChannelSettings(interaction.guildId);
        console.log(id);
    }catch(error){
        
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('Adds a new changelog entry')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new changelog entry')
                .addStringOption(option => 
                    option.setName('headline')
                        .setDescription('The headline for the changelog')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('description')
                        .setDescription('The detailed description of the changelog')
                        .setRequired(true))
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('setchannel')
                .setDescription('Select channel to post changelog in')
                .addChannelOption(option => 
                    option.setName('channel')
                        .setDescription('Select channel')
                        .addChannelTypes(ChannelType.GuildText)
                )
        )
        .addSubcommand(subcommand => 
            subcommand
                .setName('current')
                .setDescription('Check which channel is currently selected for posting changelogs')
            ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await handleAddChangelog(interaction);
                break;
            case 'setchannel':
                await handleSetChannel(interaction);
                break;
            case 'current':
                await handleCheckChannel(interaction);
                break;
            default:
                await interaction.reply({ content: "Unknown subcommand", ephemeral: true });
                break;
        }
    }
}