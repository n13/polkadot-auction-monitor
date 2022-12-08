const fetch = require('node-fetch')

const post = async (url, params, isJson = true) => {
    try {
        let res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });
        if (isJson) 
            return res.json();
        else 
            return res
    } catch (err) {
        console.log("post error: " + err)
        throw err
    }
}

module.exports = post