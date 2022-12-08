#!/usr/bin/env node

require('dotenv').config()
const { ApiPromise, WsProvider } = require("@polkadot/api");

const getAuctionInfo = async (api) => {

  const reserved = await api.query.auctions.reservedAmounts.entries();
  //console.log("reserved "+JSON.stringify(reserved, null, 2))

  const reservedObjects = reserved.map(
    ([k, v]) => { 
      return { 
        key: k.toHuman(), 
        parachainAccount: k.toHuman()[0][0],
        paraChainId: parseInt(k.toHuman()[0][1].replace(/,/g, '')),
        amount: v / 1E10
      } })

  //console.log("reserved obj "+JSON.stringify(reservedObjects, null, 2))

  return { auctions: reservedObjects }

}

const runGetAuctionInfo = async () => {
  const provider = new WsProvider("wss://rpc.polkadot.io");  
  const api = await ApiPromise.create({ provider });
  const res = await getAuctionInfo(api)
  api.disconnect()
  return res;
}


module.exports = runGetAuctionInfo