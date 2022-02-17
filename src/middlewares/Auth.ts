import { Response, NextFunction } from "express";
import httpCodes from "http-status-codes";
import moment from "moment";
import { httpResponse } from "../utils/http_response";
import Utils from "../utils/utils";
import AdminService from "../services/AdminService";
import UserService from "../services/UserService";
import redisClient from "../config/redis";
import { config } from "../config/config";

/**
  * authToken
  * @desc A middleware to authenticate users token
  * @param {Object} req request any
  * @param {Object} res response object
  * @param {Function} next nextFunction middleware
  * @returns {void|Object} object
  */
export const authToken = (req: any, res: Response, next: NextFunction) => {
    try {
        const bearerToken = req.headers["authorization"];
        if (!bearerToken) {
            const errMessage = "Access denied. No token provided.";

            return httpResponse.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
        }
        const token = bearerToken.split(' ')[1];
        // Verify token
        const decoded = Utils.verifyToken(token);
        req.id = decoded.id;

        next();
    } catch (err) {
        const errMessage = "Invalid token. Please login";
        return httpResponse.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
    }
};

/**
   * authAdmin
   * @desc A middleware to authenticate admin users
   * @param {Object} req request any
   * @param {Object} res response object
   * @param {Function} next nextFunction middleware
   * @returns {void|Object} object
   */
export const authAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const admin = await AdminService.getAdminIdAndRole(req.id);
        if (!admin) {
            const errMessage = "Admin does not exist";
            return httpResponse.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
        }
        req.user = admin;
        next();
    } catch (err) {
        const errMessage = "Admin does not exist";
        return httpResponse.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
    }
};

/**
 * rateLimiter
 * @desc A middleware that uses redis to implement rate limiting per userId
 * @param req {Object} req request any
 * @param res {Object} res response object
 * @param next {Function} next nextFunction middleware
 * @returns {void|Object} object
 */
export const rateLimiter = (req: any, res: Response, next: NextFunction) => {
    try {
        // * fetch records of current user using user ID, returns null when no record is found
        redisClient.get(req.id, (err, record) => {
            if (err) {
                return httpResponse.errorResponse(
                    res,
                    err.message,
                    httpCodes.UNPROCESSABLE_ENTITY
                );
            }
            const currentRequestTime = moment();
            // *  if no record is found , create a new record for user and store to redis
            if (record == null) {
                const newRecord = [];
                const requestLog = {
                    requestTimeStamp: currentRequestTime.unix(),
                    requestCount: 1,
                };
                newRecord.push(requestLog);
                redisClient.set(req.id, JSON.stringify(newRecord));
                return next();
            }
            // * if record is found, parse it's value and calculate number of requests users has made within the last window
            const data = JSON.parse(record);
            const windowStartTimestamp = moment()
                .subtract(config.windowSizeInHours, "hours")
                .unix();
            const requestsWithinWindow = data.filter((entry: any) => {
                return entry.requestTimeStamp > windowStartTimestamp;
            });
            const totalWindowRequestsCount = requestsWithinWindow.reduce(
                (accumulator: any, entry: any) => {
                    return accumulator + entry.requestCount;
                },
                0
            );
            // * if number of requests made is greater than or equal to the desired maximum, return error
            if (totalWindowRequestsCount >= config.maxWindowRequestCount) {
                const errMessage = `You have exceeded the ${config.maxWindowRequestCount} requests in ${config.windowSizeInHours} hours limit!`;
                return httpResponse.errorResponse(
                    res,
                    errMessage,
                    httpCodes.TOO_MANY_REQUESTS
                );
            } else {
                // * if number of requests made is less than allowed maximum, log new entry
                const lastRequestLog = data[data.length - 1];
                const potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
                    .subtract(config.windowLoginInterval, "hours")
                    .unix();
                // *  if interval has not passed since last request log, increment counter
                if (
                    lastRequestLog.requestTimeStamp >
                    potentialCurrentWindowIntervalStartTimeStamp
                ) {
                    lastRequestLog.requestCount++;
                    data[data.length - 1] = lastRequestLog;
                } else {
                    // *  if interval has passed, log new entry for current user and timestamp
                    data.push({
                        requestTimeStamp: currentRequestTime.unix(),
                        requestCount: 1,
                    });
                }
                redisClient.set(req.id, JSON.stringify(data));
                next();
            }
        });
    } catch (error) {
        return httpResponse.errorResponse(res, "server error", httpCodes.INTERNAL_SERVER_ERROR);
    }
};

/**
  * authUser
  * @desc A middleware to authenticate users
  * @param {Object} req request any
  * @param {Object} res response object
  * @param {Function} next nextFunction middleware
  * @returns {void|Object} object
  */
export const authUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.checkIfUserExist(req.id);
        if (!user) {
            const errMessage = "User does not exist";
            return httpResponse.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
        }
        req.user = user;
        next();
    } catch (err) {
        const errMessage = "User does not exist";
        return httpResponse.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
    }
};