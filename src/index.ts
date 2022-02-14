import { app } from "./app"
import { config } from "./config/config";
// import { logger } from "./utils/logger"

//Starts Server
app.listen(config.port, () => {
    console.log(`App is listen on Port ${config.port}`)
    // logger.info(`App is listen on Port ${settings.port}`)
})
