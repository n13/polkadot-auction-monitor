const post = require('./post')

const reportError = async (errorString) => {
    try {
        const webHookURL = process.env.DISCORD_WEBHOOK
        const message = {
            "content": "Hashed Bot Mark 2\n<@&764820935395901490>\n" + errorString
        }
        await post(webHookURL, message, false);    

    } catch (err) {
        console.error("error reporting error: "+err)
    }
}

module.exports = reportError