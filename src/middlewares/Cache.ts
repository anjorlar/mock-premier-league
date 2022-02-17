import { Response, NextFunction } from "express";
import httpCodes from "http-status-codes";
import { httpResponse } from "../utils/http_response";
import Utils from "../utils/utils";
import redisClient from "../config/redis";

/**
 * cachedFixtures
 * @desc A middleware to fetch cached fixtures
 * @param {Object} req request any
 * @param {Object} res response object
 * @param {Function} next nextFunction middleware
 * @returns {void|Object} object
 */
export const cachedFixtures = (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const status = req.query.status ? req.query.status : "all";
        console.log('status', status)
        redisClient.get(`fixtures:${status}`, (err: any, fixtures: any) => {
            if (err) throw err;
            if (fixtures) {
                // const { limit, page } = req.query;
                const dataArray = JSON.parse(fixtures);
                // const result = Utils.paginator(
                //     dataArray,
                //     parseInt(limit),
                //     parseInt(page)
                // );
                return httpResponse.successResponse(
                    res,
                    dataArray,
                    "fixtures found",
                    httpCodes.OK
                );
            }

            next();
        });
    } catch (err) {
        const errMessage = "Server error";
        return httpResponse.errorResponse(
            res,
            errMessage,
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
};

/**
 * cachedFixture
 * @desc A middleware to cache a fixture
 * @param {Object} req request any
 * @param {Object} res response object
 * @param {Function} next nextFunction middleware
 * @returns {void|Object} object
 */
export const cachedFixture = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const fixtureId = req.params.id;
        redisClient.get(`${fixtureId}`, (err: any, data: any) => {
            if (err) throw err;
            if (data) {
                const fixture = JSON.parse(data);
                return httpResponse.successResponse(
                    res,
                    { fixture },
                    "fixture found",
                    httpCodes.OK
                );
            }

            next();
        });
    } catch (err) {
        const errMessage = "Server error";
        return httpResponse.errorResponse(
            res,
            errMessage,
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
};

/**
 * cachedTeam
 * @desc A middleware to cache a team
 * @param {Object} req request any
 * @param {Object} res response object
 * @param {Function} next nextFunction middleware
 * @returns {void|Object} object
 */
export const cachedTeam = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const teamId = req.params.id;
        redisClient.get(`${teamId}`, (err: any, data: any) => {
            if (err) throw err;
            if (data) {
                const team = JSON.parse(data);
                return httpResponse.successResponse(
                    res,
                    { team },
                    "team found",
                    httpCodes.OK
                );
            }

            next();
        });
    } catch (err) {
        const errMessage = "Server error";
        return httpResponse.errorResponse(
            res,
            errMessage,
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
};

/**
 * cachedTeams
 * @desc A middleware to cache teams
 * @param {Object} req request any
 * @param {Object} res response object
 * @param {Function} next nextFunction middleware
 * @returns {void|Object} object
 */
export const cachedTeams = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        redisClient.get("teams", async (err: any, teams: any) => {
            if (err) throw err;
            if (teams) {
                // const { limit, page } = req.query;
                const dataArray = JSON.parse(teams);
                // const result = await Utils.paginator(
                // dataArray,
                // parseInt(limit),
                // parseInt(page)
                // );
                return httpResponse.successResponse(
                    res,
                    dataArray,
                    "teams found",
                    httpCodes.OK
                );
            }

            next();
        });
    } catch (err) {
        const errMessage = "Server error";
        return httpResponse.errorResponse(
            res,
            errMessage,
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
};

/**
 * cachedSearch
 * @desc A middleware to cache search query
 * @param {Object} req request any
 * @param {Object} res response object
 * @param {Function} next nextFunction middleware
 * @returns {void|Object} object
 */
export const cachedSearch = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const search = req.query.search;
        redisClient.get(`${search}`, (err: any, data: any) => {
            if (err) throw err;
            if (data) {
                const result = JSON.parse(data);
                return httpResponse.successResponse(
                    res,
                    result,
                    "search results returned",
                    httpCodes.OK
                );
            }

            next();
        });
    } catch (err) {
        const errMessage = "Server error";
        return httpResponse.errorResponse(
            res,
            errMessage,
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
};