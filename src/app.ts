import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes"
import morgan from "morgan"

// imported modules
import { config } from "./config/config"
import { logger } from "./utils/logger"
import { connectMongoDb } from "./config/mongodb"
import redis from "./config/redis"
import { httpResponse } from "./utils/http_response"
import BaseRoute from "./routes/IndexRoute"

// Init express
const app: Application = express();

//connects redis
console.log(">>>>> app is up and running")
//connects DB
connectMongoDb()

app.disable("x-powered-by");
console.log(">>>>> app is up and running @@@@@222")

app.use(helmet())
app.use(cors())

if (config.environment === 'development') {
    app.use(morgan('dev'))
}
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Route
app.use("/api/v1", BaseRoute)

app.get("/", (req: Request, res: Response) => {
    return httpResponse.successResponse(
        res,
        { githuburl: `https://github.com/anjorlar/mock-premier-league.git` },
        `Welcome to a Mock API of a football league`
    );
});

//handle error
app.all("/*", (req: Request, res: Response) => {
    return httpResponse.errorResponse(
        res, `${StatusCodes.NOT_FOUND} -  Not found`, StatusCodes.NOT_FOUND
    )
})

app.use((err: any, req: Request, res: Response) => {
    console.log(err.stack)
    logger.error(err.stack)
    return httpResponse.errorResponse(
        res, err.message, err.stack || StatusCodes.INTERNAL_SERVER_ERROR
    )
})

export { app }