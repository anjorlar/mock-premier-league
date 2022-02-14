/**
 * Loads in environmental variable using dotenv and
 *  declare environmental variable in config 
 */

import dotenv from "dotenv";
dotenv.config();

interface IEnv {
    appName: string;
    baseUrl: string;
    port: Number;
    mongoDb: IMongoDb;
    environment: string;
    jwt: IJWT;
    salt: number;
    redis: any;
    windowSizeInHours: number;
    maxWindowRequestCount: number;
    windowLoginInterval: number
}

interface IMongoDb {
    uri: string;
    testUri: string;
    collections: ICollections
}

interface ICollections {
    user: string;
    admin: string;
    team: string;
    fixture: string;
}

interface IJWT {
    SECRETKEY: string;
    expires: number;
    issuer: string;
    alg: any;
}

const config: IEnv = {
    appName: 'Mock Premier League',
    baseUrl: process.env.BASE_URL!,
    environment: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT),
    mongoDb: {
        uri: process.env.MONGODB_URI!,
        testUri: process.env.MONGODB_TEST_URI!,
        collections: {
            user: "user",
            admin: "admin",
            team: "team",
            fixture: "fixture",
        },
    },
    jwt: {
        SECRETKEY: process.env.JWT_SECRET_KEY!,
        expires: Number(process.env.JWT_EXPIRY)!,
        issuer: process.env.ISSUER!,
        alg: process.env.JWT_ALG!,
    },
    salt: Number(process.env.SALT_ROUND)!,
    redis: {
        url: process.env.REDIS_URL!,
        host: process.env.REDIS_HOST!,
        port: process.env.REDIS_PORT!
    },
    windowSizeInHours: Number(process.env.WINDOW_SIZE_IN_HOURS),
    maxWindowRequestCount: Number(process.env.MAX_WINDOW_REQUEST_COUNT),
    windowLoginInterval: Number(process.env.WINDOW_LOG_INTERVAL_IN_HOURS),
}

export { config }