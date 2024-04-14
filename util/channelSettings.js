const fs = require('fs');
const path = require('path');
const SETTINGS_FILE_PATH = path.join(__dirname, '../settings.json');

function saveChannelSetting(guildId, channelId){
    let settings = readSettings();

    if(!settings[guildId]){
        settings[guildId] = {};
    }

    settings[guildId].channelId = channelId;

    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 4));
    console.log("Channel settings saved successfully for guild: ", guildId);
}

function getChannelSettings(guildId){
    let settings = readSettings();

    if(settings[guildId] && settings[guildId].channelId){
        return settings[guildId].channelId;
    }
    return null;
}

function readSettings(guildId){
    try{
        let data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Failed to read settings file: ", error);
        return {};
    }
}

module.exports = {
    saveChannelSetting,
    getChannelSettings
};