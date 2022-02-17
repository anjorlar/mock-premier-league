process.env.NODE_ENV = 'test'

import Utils from "../../utils/utils";
import expect from "expect";
import Joi from "joi";

describe("UTILS", () => {
    describe("validate password", () => {
        it("should be false when password do not match", async () => {
            const validate = await Utils.validatePassword("password", "password");
            expect(validate).toBeFalsy();
        });

        it("should be true when password match hashed password", async () => {
            const hashedPassword = await Utils.hashPassword("password");
            const validate = await Utils.validatePassword("password", hashedPassword);
            expect(validate).toBeTruthy();
        });
    });

    describe("validate request", () => {
        it("should throw error when required field is missing", async () => {
            const TestSchema = Joi.object({
                field: Joi.string().required(),
            });
            const body = {};
            const error = await Utils.validateRequest(body, TestSchema);

            expect(error).toBeTruthy();
        });
    });

    describe("paginator", () => {
        const data = [{}, {}, {}];
        it("should return an object containing count as 3", async () => {
            const paginator = await Utils.paginator(data);
            expect(paginator.count).toBe(data.length);
        });
        it("should return an object containing next field when limit is passed to it", async () => {
            const paginator = await Utils.paginator(data, 1);
            expect(paginator.next).toMatchObject({ page: 2, limit: 1 });
        });
        it("should return an object containing previous field when page is greater than 1 is passed to it", async () => {
            const paginator = await Utils.paginator(data, 1, 2);
            expect(paginator.previous).toMatchObject({ page: 1, limit: 1 });
        });
    });

    describe("generate fixture link", () => {
        it("should return a string", () => {
            const uri = Utils.generateFixtureLink("test");

            expect(uri).toBeTruthy();
        });
    });
});
