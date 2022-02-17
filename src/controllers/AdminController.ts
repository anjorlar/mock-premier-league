import { Response } from "express";
import httpCodes from "http-status-codes";
import { IRequestAdmin, IAdmin } from "../utils/types/custom";
import AdminService from "../services/AdminService";
import { logger } from "../utils/logger";
import { httpResponse } from "../utils/http_response";
import { CreateAdminSchema } from "../utils/validator/admin";
import { CredentialSchema } from "../utils/validator/auth";
import Utils from "../utils/utils";

/**
 * createNewAdmin
 * @desc As an admin with the role admin you should be able create other admin user with unique email
 * Route: POST: '/api/v1/admin/register'
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns {void|Object} object
 */
export async function createNewAdmin(req: IRequestAdmin, res: Response) {
    try {
        // validate request payload
        const errors = await Utils.validateRequest(req.body, CreateAdminSchema);
        if (errors) {
            return httpResponse.errorResponse(res, errors, httpCodes.BAD_REQUEST);
        }

        const { name, email, role, password } = req.body;

        const checkEmail = await AdminService.getAdminByEmail(email.toLowerCase());
        if (checkEmail) {
            const errMessage = "Email already exists";
            return httpResponse.errorResponse(
                res,
                errMessage,
                httpCodes.BAD_REQUEST
            );
        }

        const adminObject: IAdmin = {
            name: name.toLowerCase(),
            email: email.toLowerCase(),
            role: role.toLowerCase(),
            password: password,
        };

        // save admin
        const admin = await AdminService.createAdmin(adminObject);
        const token = admin.generateAuthToken();

        return httpResponse.successResponse(
            res,
            { admin, token },
            "Admin created successfully",
            httpCodes.CREATED
        );
    } catch (error) {
        logger.error(JSON.stringify(error));
        // const err = error.message
        console.log('>>>> error', error)

        return httpResponse.errorResponse(
            res,
            // 'error.message',
            error,
            httpCodes.INTERNAL_SERVER_ERROR
        );
    }
}


/**
   * adminLogin
   * @desc As an admin you should be able login
   * Route: POST: '/api/v1/admin/login'
   * @param {Object} req request object
   * @param {Object} res response object
   * @returns {void|Object} object
   */
export async function adminLogin(req: IRequestAdmin, res: Response) {
    try {
        const errors = await Utils.validateRequest(req.body, CredentialSchema);
        if (errors) {
            return httpResponse.errorResponse(res, errors, httpCodes.BAD_REQUEST);
        }

        // check if user exists
        const email = req.body.email.toLowerCase();

        const admin: any = await AdminService.getAdminByEmail(email);
        if (!admin) {
            const errMessage = 'Invalid login credentials';
            return httpResponse.errorResponse(res, errMessage, httpCodes.NOT_FOUND);
        }

        // verify password and generate token
        const passwordMatch = await Utils.validatePassword(req.body.password, admin.password);
        if (!passwordMatch) {
            const errMessage = "Invalid login credentials";
            return httpResponse.errorResponse(res, errMessage, httpCodes.UNAUTHORIZED);
        }
        const token = admin.generateAuthToken();

        const message = 'Admin login successful';
        return httpResponse.successResponse(res, { user: admin, token }, message, httpCodes.OK);

    } catch (error) {
        logger.error(JSON.stringify(error));
        // const err = error.message
        console.log('>>>> error', error)
        return httpResponse.errorResponse(res, error, httpCodes.INTERNAL_SERVER_ERROR);
    }
}
