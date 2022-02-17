import { Response } from "express";
import httpCodes from "http-status-codes";
import { IRequestUser, IUser } from "../utils/types/custom";
import UserService from "../services/UserService";
import { logger } from "../utils/logger";
import { httpResponse } from "../utils/http_response";
import { CreateUserSchema } from "../utils/validator/user";
import { CredentialSchema } from "../utils/validator/auth";
import Utils from "../utils/utils";


/**
 * createUser
 * @desc A new user should be created
 * Route: POST: '/api/v1/register'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function createUser(req: IRequestUser, res: Response) {
    try {
        // validate request object
        const errors = await Utils.validateRequest(req.body, CreateUserSchema);
        if (errors) {
            return httpResponse.errorResponse(res, errors, httpCodes.BAD_REQUEST);
        }
        const { name, email, password } = req.body;

        // check if user exists
        const existingUser = await UserService.getUserByEmail(email.toLowerCase());
        if (existingUser) {
            const errMessage = "User already exists";
            return httpResponse.errorResponse(
                res,
                errMessage,
                httpCodes.BAD_REQUEST
            );
        }
        const userObject: IUser = {
            name: name.toLowerCase(),
            email: email.toLowerCase(),
            password: password,
        };

        // create user
        const user = await UserService.createUser(userObject);

        // * create token
        const token = user.generateAuthToken();

        const message = "User created successfully";
        // * return newly created user
        return httpResponse.successResponse(
            res,
            { user, token },
            message,
            httpCodes.CREATED
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        return httpResponse.errorResponse(
            res,
            error,
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}



/**
 * loginUser
 * @desc As a user with correct credentials you should be able login
 * Route: POST: '/api/v1/login'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function loginUser(req: IRequestUser, res: Response) {
    try {
        const errors = await Utils.validateRequest(req.body, CredentialSchema);
        if (errors) {
            return httpResponse.errorResponse(res, errors, httpCodes.BAD_REQUEST);
        }

        // check if user exists
        const email = req.body.email.toLowerCase();

        const user: any = await UserService.getUserByEmail(email);
        if (!user) {
            const errMessage = "Invalid login credentials";
            return httpResponse.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
        }

        // verify password and generate token
        const passwordMatch = await Utils.validatePassword(
            req.body.password,
            user.password
        );
        if (!passwordMatch) {
            const errMessage = "Invalid login credentials";
            return httpResponse.errorResponse(
                res,
                errMessage,
                httpCodes.UNAUTHORIZED
            );
        }
        const token = user.generateAuthToken();

        const message = "User login successful";
        return httpResponse.successResponse(
            res,
            { user, token },
            message,
            httpCodes.OK
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        return httpResponse.errorResponse(
            res,
            error,
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}