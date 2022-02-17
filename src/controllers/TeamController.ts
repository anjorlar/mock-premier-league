import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import httpCodes from "http-status-codes";

import Utils from "../utils/utils";
import { logger } from "../utils/logger";
import TeamService from "../services/TeamService";
import FixtureService from "../services/FixtureService";
import { httpResponse } from "../utils/http_response";
import { ITeam, IRequestAdmin } from "../utils/types/custom";
import { CreateTeamSchema, UpdateTeamSchema } from "../utils/validator/team";

/**
 * newTeam
 * @desc An admin should be able to create a team
 * Route: POST: '/api/v1/teams'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function newTeam(req: IRequestAdmin, res: Response) {
    try {
        const errors = await Utils.validateRequest(req.body, CreateTeamSchema);
        if (errors) {
            return httpResponse.errorResponse(res, errors, httpCodes.BAD_REQUEST);
        }

        const existingTeam = await TeamService.findTeamByName(
            req.body.name.toLowerCase()
        );
        if (existingTeam) {
            const errMessage = "team already exists";
            return httpResponse.errorResponse(
                res,
                errMessage,
                httpCodes.BAD_REQUEST
            );
        }

        const createdBy = req.user?._id;
        const teamObject: ITeam = {
            name: req.body.name.toLowerCase(),
            manager: req.body.manager.toLowerCase(),
            teamId: uuidv4(),
            color: req.body.color.toLowerCase(),
            stadium: req.body.stadium.toLowerCase(),
            meta: {
                nickname: req.body.nickname ? req.body.nickname.toLowerCase() : null,
            },
            createdBy,
        };

        // save Team
        const team = await TeamService.createTeam(teamObject);

        Utils.removeDataFromCache("teams");

        return httpResponse.successResponse(
            res,
            { team },
            "Team created successfully",
            httpCodes.CREATED
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        return httpResponse.errorResponse(
            res,
            "server error",
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}

/**
 * getTeam
 * @desc An admin get the details of a team with given id
 * Route: GET: '/api/v1/teams/:id'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function getTeam(req: Request, res: Response) {
    try {
        const teamId = req.params.id;

        const team: any = await TeamService.findTeamById(teamId);

        if (!team) {
            return httpResponse.errorResponse(
                res,
                "team not found",
                httpCodes.NOT_FOUND
            );
        }

        Utils.addDataToCache(teamId, team);

        return httpResponse.successResponse(
            res,
            { team },
            "team found",
            httpCodes.OK
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        return httpResponse.errorResponse(
            res,
            "server error",
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}

/**
 * updateTeam
 * @desc An admin should be able to update a team with the given id
 * Route: PUT: '/api/v1/teams/:id'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function updateTeam(req: IRequestAdmin, res: Response) {
    try {
        const teamId = req.params.id;

        const errors = await Utils.validateRequest(req.body, UpdateTeamSchema);
        if (errors) {
            return httpResponse.errorResponse(res, errors, httpCodes.BAD_REQUEST);
        }

        const team = await TeamService.checkTeamById(teamId);
        if (!team) {
            return httpResponse.errorResponse(
                res,
                "team does not exist",
                httpCodes.NOT_FOUND
            );
        }

        if (req.body.name) {
            const existingTeam = await TeamService.findTeamByName(
                req.body.name.toLowerCase()
            );

            if (existingTeam) {
                return httpResponse.errorResponse(
                    res,
                    "team already exists",
                    httpCodes.BAD_REQUEST
                );
            }
        }

        const updateObject: any = {};

        updateObject.name = req.body.name ? req.body.name.toLowerCase() : team.name;
        updateObject.manager = req.body.manager
            ? req.body.manager.toLowerCase()
            : team.manager;
        updateObject.color = req.body.color
            ? req.body.color.toLowerCase()
            : team.color;
        updateObject.stadium = req.body.stadium
            ? req.body.stadium.toLowerCase()
            : team.stadium;
        updateObject["meta.nickname"] = req.body.nickname
            ? req.body.nickname.toLowerCase()
            : team.meta.nickname;
        const updatedTeam = await TeamService.updateTeam(team._id, updateObject);

        Utils.removeDataFromCache(teamId);

        return httpResponse.successResponse(
            res,
            { team: updatedTeam },
            "team updated successfully",
            httpCodes.OK
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        return httpResponse.errorResponse(
            res,
            "server error",
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}

/**
 * getAllTeams
 * @desc An admin should get all the teams
 * Route: GET: '/api/v1/teams'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function getAllTeams(req: any, res: Response) {
    try {
        const { limit, page }: any = req.query;

        const teams: any = await TeamService.getAllTeams();

        if (!teams.length) {
            return httpResponse.errorResponse(
                res,
                "no teams found",
                httpCodes.NOT_FOUND
            );
        }

        Utils.addDataToCache("teams", teams);

        const result = await Utils.paginator(teams, limit, page);

        return httpResponse.successResponse(
            res,
            result,
            "teams found",
            httpCodes.OK
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        return httpResponse.errorResponse(
            res,
            "server error",
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}

/**
 * removeTeam
 * @desc An admin should remove a team with the given id
 * Route: DELETE: '/api/v1/teams'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function removeTeam(req: any, res: Response) {
    try {
        const teamId = req.params.id;

        const team: any = await TeamService.removeTeam(teamId);

        Utils.removeDataFromCache(teamId);

        return httpResponse.successResponse(
            res,
            [],
            "team deleted successfully",
            httpCodes.OK
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        return httpResponse.errorResponse(
            res,
            "server error",
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}

export async function search(req: Request, res: Response) {
    try {
        const search: any = req.query.search;
        const { limit, page }: any = req.query;
        if (!search) {
            return httpResponse.errorResponse(
                res,
                "Please Pass a search value",
                httpCodes.BAD_REQUEST
            );
        }
        const team = await TeamService.search(search);
        const fixture = await FixtureService.search(search);

        Utils.addDataToCache(search, [...team, ...fixture]);

        const result = await Utils.paginator([...team, ...fixture], limit, page);

        return httpResponse.successResponse(
            res,
            result,
            "search results returned",
            httpCodes.OK
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        return httpResponse.errorResponse(
            res,
            "server error",
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}
