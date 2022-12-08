require('dotenv').config()

const sleep = require('./helpers/sleep')
const post = require('./helpers/post')
const runGetAuctionInfo = require('./helpers/getAuctionInfo')

const CHECK_INTERVAL = 30 * 1000
const ALIVE_MESSAGE_INTERVAL = 60 * 60 * 1000
const webHookURL = process.env.MONITOR_WEBHOOK
const PARACHAIN_ID_WINNER = 2093

const sendMessage = async (notify, message) => {
    try {
        var messageObj
        if (notify) {
            messageObj = {
                "content": "Auction Monitor\n<@&764820935395901490>\n" + message
            }
        } else {
            messageObj = {
                "content": "Auction Monitor\n" + message
            }
        }    

       //console.log("sending "+JSON.stringify(messageObj, null, 2)) /// DEBUG
        await post(webHookURL, messageObj, false)
    } catch (err) {
        console.error("sendMessage error: "+err)
        throw err
    }
}

var lastAlive = 0
const sendAlive = async (message) => {
    const now = Date.now()
    console.log("now "+now)
    console.log("diff "+(now - lastAlive))
    console.log("int "+ALIVE_MESSAGE_INTERVAL)
    if (now - lastAlive < ALIVE_MESSAGE_INTERVAL) {
        return
    }
    lastAlive = now
    messageObj = {
        "content": "Auction monitor " + " standings \n" + message
    }        
    console.log("sending "+JSON.stringify(messageObj, null, 2)) /// DEBUG
    await post(webHookURL, messageObj, false)
}

const monitor = async () => {

    while (true) {
        try {
            
            console.log("checking auctions...")
            await sendMessage(false, "Auction Monitor Starting")

            res = await runGetAuctionInfo()

            var maxBid = 0
            var winner = -1

            const mapped  = res.auctions.map(e => {
                if (e.amount > maxBid) {
                    maxBid = e.amount
                    winner = e.paraChainId
                }
                return {
                    id: e.paraChainId,
                    amount: e.amount,
                    string: e.paraChainId + ": " + e.amount.toFixed(4) + " DOT"
                }
            })

            console.log("winner: " +winner + " max bid: "+maxBid)

            var message = ""
            mapped.forEach(element => {
                message = message + element.string + "\n"
            });

            const outbid = winner != PARACHAIN_ID_WINNER
            
            if (outbid) {
                await sendMessage(true, "We were outbid!" + "\n" + message)
            } else {
                await sendAlive(message)
            }
            
            await sleep(CHECK_INTERVAL)

        } catch (err) {
            console.error("Contract monitor error: "+err)

            await sendMessage(false, "Contract monitor process error: "+err)

            await sleep(CHECK_INTERVAL)
        }
    }
}

monitor()