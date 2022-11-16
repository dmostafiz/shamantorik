const NodeCache = require('node-cache')
const consoleLog = require('../Helpers/consoleLog')

const cache = new NodeCache()

module.exports = duration => (req, res, next) => {
    if(req.method !== 'GET'){
        consoleLog('Cannot cache', 'non-GET methods')
        return next()
    }

    const key = req.originalUrl
    const cachedResponse = cache.get(key)

    if(cachedResponse){
        consoleLog('cache get for', key)
        res.send(cachedResponse)
    }
    else{
        consoleLog('cache miss for', key)
        res.originalSend = res.send
        res.send = body => {
            res.originalSend(body)
            cache.set(key, body, +duration * 1000)
        }

        next()
    }
}