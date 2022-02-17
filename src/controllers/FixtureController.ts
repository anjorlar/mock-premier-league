import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import httpCodes from "http-status-codes";

import Utils from "../utils/utils";
import { logger } from "../utils/logger";
import TeamService from "../services/TeamService";
import FixtureService from "../services/FixtureService";
import { httpResponse } from "../utils/http_response";
import { IRequestAdmin } from "../utils/types/custom";
import { CreateFixtureSchema, UpdateFixtureSchema } from "../utils/validator/fixture";



/**
 * newFixture
 * @desc An admin should be able to create fixture
 * Route: POST: '/api/v1/fixtures'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function newFixture(req: IRequestAdmin, res: Response) {
    try {
        const errors = await Utils.validateRequest(req.body, CreateFixtureSchema);
        if (errors) {
            return httpResponse.errorResponse(res, errors, httpCodes.BAD_REQUEST);
        }
        // home and away must be different teams
        if (req.body.home === req.body.away) {
            return httpResponse.errorResponse(
                res,
                "home and away must be different teams",
                httpCodes.BAD_REQUEST
            );
        }

        const home: any = await TeamService.checkTeamById(req.body.home);
        const away: any = await TeamService.checkTeamById(req.body.away);

        if (!home || !away) {
            const errMessage = home ? "home does not exist" : "away does not exist";
            return httpResponse.errorResponse(
                res,
                errMessage,
                httpCodes.BAD_REQUEST
            );
        }

        // availability of both teams on that day
        const homeTeam = await FixtureService.checkAvailabityOfTeam(
            home._id,
            new Date(req.body.kickOff).toISOString()
        );
        const awayTeam = await FixtureService.checkAvailabityOfTeam(
            away._id,
            new Date(req.body.kickOff).toISOString()
        );

        if (homeTeam || awayTeam) {
            const errMessage = homeTeam
                ? `${home.name} has a fixture on the ${req.body.kickOff}`
                : `${away.name} has a fixture on the ${req.body.kickOff}`;
            return httpResponse.errorResponse(
                res,
                errMessage,
                httpCodes.BAD_REQUEST
            );
        }
        // generate link and add to req body
        const fixtureId = uuidv4();

        const link = Utils.generateFixtureLink(fixtureId);

        const fixtureObject = {
            home: home._id,
            away: away._id,
            kickOff: req.body.kickOff,
            fixtureId,
            venue: home.stadium,
            link,
        };

        const fixture = await FixtureService.createFixture(fixtureObject);
        const homeFixtures = [...home.meta.fixtures, fixture._id];
        const awayFixtures = [...away.meta.fixtures, fixture._id];
        await TeamService.updateTeamFixtures(home._id, homeFixtures);
        await TeamService.updateTeamFixtures(away._id, awayFixtures);

        Utils.removeDataFromCache("fixtures:all");
        Utils.removeDataFromCache("fixtures:pending");
        Utils.removeDataFromCache("teams");
        Utils.removeDataFromCache(`${home.teamId}`);
        Utils.removeDataFromCache(`${away.teamId}`);
        Utils.removeDataFromCache("teams");

        return httpResponse.successResponse(
            res,
            { fixture },
            "fixture created successfully",
            httpCodes.CREATED
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        console.error('>>>> err', error)
        return httpResponse.errorResponse(
            res,
            "server error",
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}

/**
 * getFixtureAdmin
 * @desc An admin can get the details of a fixture with given id
 * Route: GET: '/api/v1/admin/fixtures/:id'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function getFixtureAdmin(req: Request, res: Response) {
    try {
        const fixtureId = req.params.id;

        const fixture = await FixtureService.findFixtureByMongoId(fixtureId);
        if (!fixture) {
            return httpResponse.errorResponse(
                res,
                "no fixture found",
                httpCodes.NOT_FOUND
            );
        }

        Utils.addDataToCache(fixtureId, fixture);

        return httpResponse.successResponse(
            res,
            { fixture },
            "fixture returned successfully",
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
 * getFixture
 * @desc users can get the details of a fixture with given id
 * Route: GET: '/api/v1/fixtures/:id'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function getFixture(req: Request, res: Response) {
    try {
        const fixtureId = req.params.id;

        const fixture = await FixtureService.findFixtureById(fixtureId);
        if (!fixture) {
            return httpResponse.errorResponse(
                res,
                "no fixture found",
                httpCodes.NOT_FOUND
            );
        }

        Utils.addDataToCache(fixtureId, fixture);

        return httpResponse.successResponse(
            res,
            { fixture },
            "fixture returned successfully",
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
 * updateFixture
 * @desc A user or admin should be able to all fixtures
 * Route: GET: '/api/v1/fixtures'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function getAllFixtures(req: any, res: Response) {
    try {
        const defaultStartDate = new Date("1970-01-01").toISOString();
        const defaultEndDate = new Date().toISOString();
        const { limit, page } = req.query;
        const query = {
            startDate: req.query.startDate
                ? new Date(req.query.startDate).toISOString()
                : defaultStartDate,
            endDate: req.query.endDate
                ? new Date(req.query.endDate).toISOString()
                : defaultEndDate,
            status: req.query.status
                ? [req.query.status]
                : ["pending", "on-going", "completed", "abandoned"],
        };
        const fixtures = await FixtureService.findFixtures(query);
        if (!fixtures.length) {
            return httpResponse.errorResponse(
                res,
                "no fixtures found",
                httpCodes.NOT_FOUND
            );
        }

        const status = req.query.status ? req.query.status : "all";
        Utils.addDataToCache(`fixtures:${status}`, fixtures);

        const result = await Utils.paginator(fixtures, limit, page);

        return httpResponse.successResponse(
            res,
            result,
            "fixtures found",
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
 * updateFixture
 * @desc An admin should be able to update a fixture with the given id
 * Route: PUT: '/api/v1/fixtures/:id'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function updateFixture(req: IRequestAdmin, res: Response) {
    try {
        const fixtureId = req.params.id;
        const errors = await Utils.validateRequest(req.body, UpdateFixtureSchema);
        if (errors) {
            return httpResponse.errorResponse(res, errors, httpCodes.BAD_REQUEST);
        }

        const fixture: any = await FixtureService.findFixtureById(fixtureId);
        if (!fixture) {
            return httpResponse.errorResponse(
                res,
                "fixture not found",
                httpCodes.NOT_FOUND
            );
        }

        const fixtureObject: any = {};

        // availability of both teams on that day
        if (req.body.kickOff) {
            const homeTeam = await FixtureService.checkAvailabityOfTeam(
                fixture.home,
                req.body.kickOff
            );
            const awayTeam = await FixtureService.checkAvailabityOfTeam(
                fixture.away,
                req.body.kickOff
            );

            if (homeTeam || awayTeam) {
                const errMessage = homeTeam
                    ? `home has a fixture on the ${req.body.kickOff}`
                    : `away has a fixture on the ${req.body.kickOff}`;
                return httpResponse.errorResponse(
                    res,
                    errMessage,
                    httpCodes.BAD_REQUEST
                );
            }

            fixtureObject.kickOff = req.body.kickOff;
        }

        if (req.body.status) {
            fixtureObject.status = req.body.status;
        }

        if (req.body.scoreHome || req.body.scoreAway) {
            fixtureObject["report.scores.home"] = req.body.scoreHome
                ? req.body.scoreHome
                : fixtureObject.report.score.home;
            fixtureObject["report.scores.away"] = req.body.scoreAway
                ? req.body.scoreAway
                : fixtureObject.report.score.away;
        }

        const updatedFixture = await FixtureService.updateFixture(
            fixtureId,
            fixtureObject
        );

        Utils.removeDataFromCache(fixtureId);

        const message = "Fixture updated successfully";
        return httpResponse.successResponse(
            res,
            { fixture: updatedFixture },
            message,
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
 * @desc An admin should remove a fixture with the given id when the fixture is still pending
 * Route: DELETE: '/api/v1/fixtures'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function removeFixture(req: IRequestAdmin, res: Response) {
    try {
        const fixtureId = req.params.id;
        const fixture = await FixtureService.checkPendingFixture(fixtureId);

        if (!fixture) {
            const errMessage = "fixture cannot be deleted";
            return httpResponse.errorResponse(
                res,
                errMessage,
                httpCodes.BAD_REQUEST
            );
        }

        const response = await FixtureService.removeFixture(fixtureId);

        Utils.removeDataFromCache(fixtureId);

        return httpResponse.successResponse(
            res,
            [],
            "fixture deleted successfully",
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
