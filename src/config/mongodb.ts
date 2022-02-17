/**
 * Set's up mongodb connection with mongoose
 */


import mongoose from "mongoose"
import { config } from "./config";
import { logger } from "../utils/logger"

const uri = config.environment === "test" ?
    config.mongoDb.testUri : config.mongoDb.uri

export const connectMongoDb = async () => {
    try {
        await mongoose.connect(uri, {
        });
        logger.info(`Mongo Db connected to ${uri}`)
    } catch (error) {
        logger.error("connecting to mongo db", error)
        process.exit(1)
    }
}