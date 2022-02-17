process.env.NODE_ENV = 'test'

import expect from "expect";
import request from "supertest";
import { app } from "./../../app";
import { seedUsers, users, admin, seedAdmin } from "./../seed/seed";

describe("Authentication", () => {
    describe("User", () => {
        beforeEach(async function () {
            await seedUsers();
        });
        describe("Register", () => {
            it("should register and return a new user", (done) => {
                const user = {
                    name: "Hu Jintao",
                    email: "dev@mail.com",
                    password: "password",
                };
                request(app)
                    .post("/api/v1/register")
                    .send(user)
                    .expect(201)
                    .expect((res) => {
                        expect(res.body.data.user).toMatchObject({
                            name: "hu jintao",
                            email: "dev@mail.com",
                        });
                        expect(res.body.data).toHaveProperty("token");
                    })
                    .end(done);
            });

            it("should return a 400 if required fields are missing", (done) => {
                request(app).post("/api/v1/register").send({}).expect(400).end(done);
            });

            it("should not create user if email in use", (done) => {
                request(app)
                    .post("/api/v1/register")
                    .send({ email: users[0].email, password: "password1" })
                    .expect(400)
                    .end(done);
            });
        });

        describe("Login", () => {
            it("should login user and return auth token", (done) => {
                request(app)
                    .post("/api/v1/login")
                    .send({
                        email: users[1].email,
                        password: users[1].password,
                    })
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.data).toHaveProperty("token");
                    })
                    .end(done);
            });

            it("should reject invalid login", (done) => {
                request(app)
                    .post("/api/v1/login")
                    .send({
                        email: users[1].email,
                        password: users[1].password + "fake",
                    })
                    .expect(401)
                    .end(done);
            });
        });
    })

    describe("Admin", () => {
        beforeEach(async function () {
            await seedAdmin();
        });
        describe("Login", () => {
            it("should login admin and return auth token", (done) => {
                request(app)
                    .post("/api/v1/admin/login")
                    .send({
                        email: admin[0].email,
                        password: admin[0].password,
                    })
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.data).toHaveProperty("token");
                    })
                    .end(done);
            });

            it("should reject invalid login", (done) => {
                request(app)
                    .post("/api/v1/admin/login")
                    .send({
                        email: admin[0].email,
                        password: admin[0].password + "fake",
                    })
                    .expect(401)
                    .end(done);
            });
        });
    })
});
