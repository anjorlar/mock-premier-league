/**
 * Utils object.
 * contains various helper function
 */
import { config } from "../config/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Joi from "joi";
import redisClient from "../config/redis";

const Utils = {
    /**
     * hashPassword
     * @desc encrypts a string(password)
     * @param {string} password
     * @returns {Promise<string>} string
     */
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(config.salt);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    },

    /**
     * validatePassword
     * @desc verify a string(password) matches an encrypted string(hashed password)
     * @param {string} password
     * @param {string} passwordHash
     * @returns {Promise<boolean>} boolean
     */
    async validatePassword(
        password: string,
        passwordHash: string
    ): Promise<boolean> {
        const isMatch = await bcrypt.compare(password, passwordHash);
        if (!isMatch) {
            return false;
        }
        return true;
    },

    /**
     * verifyToken
     * @desc verify and decrypts a valid jwt token
     * @param {string} token
     * @returns {string|Object}
     */
    verifyToken(token: string): any {
        try {
            const decoded = jwt.verify(token, config.jwt.SECRETKEY, {
                subject: config.appName,
                algorithms: [config.jwt.alg],
                issuer: config.jwt.issuer,
            });
            return decoded;
        } catch (error) {
            throw new Error("Invalid Token");
        }
    },

    /**
     * validateRequest
     * @desc validate data against a set of rules
     * @param {Object} requestBody
     * @param {Joi.Schema} validationSchema
     * @returns {void|string}
     */
    async validateRequest(requestBody: any, validationSchema: Joi.Schema) {
        const errors = validationSchema.validate(requestBody);

        if (errors.error) {
            return errors.error.details[0].message;
        }
    },

    /**
     * paginator
     * @desc a builder for slicing of data for pagination
     * @param {Array} dataArray
     * @param {Number} limit
     * @param {Number} page
     * @returns {Array} data
     */
    async paginator(dataArray: any = {}, limit: number = 10, page: number = 1) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const data: any = {};

        if (endIndex < dataArray.length) {
            data.next = {
                page: page + 1,
                limit: limit,
            };
        }

        if (startIndex > 0) {
            data.previous = {
                page: page - 1,
                limit: limit,
            };
        }
        data.result = dataArray.slice(startIndex, endIndex);
        data.count = dataArray.length;
        return data;
    },

    /**
     * generateFixtureLink
     * @desc a builder for generating a url
     * @param {string} str
     * @returns {string}
     */
    generateFixtureLink(str: string) {
        return `${config.baseUrl}/api/v1/fixtures/link/${str}`;
    },


    addDataToCache(str: string, data: any, duration: number = 3600) {
        redisClient.setex(str, duration, JSON.stringify(data));
    },

    removeDataFromCache(str: string) {
        redisClient.del(str);
    },
};

export default Utils;
