/*** Set's up redis connection  */
import redis from 'redis';
import { config } from "./config"
import { logger } from "../utils/logger"


const redisClient = redis.createClient({
    port: config.redis.port, host: config.redis.host
})

redisClient.on('connect', function () {
    console.log(`connection to redis Db successful`)
});

redisClient.on('error', function (err) {
    logger.error(`Unable to connect to the redis instance with error: ${err}`);
    process.exit(1);
});

export default redisClient
