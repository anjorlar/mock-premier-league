process.env.NODE_ENV = 'test'

import expect from "expect";
import request from "supertest";
import { app } from "../../app";
import {
    seedUsers,
    users,
    admin,
    seedAdmin,
    teams,
    seedTeams,
    seedFixtures
} from "../seed/seed";

beforeEach(async function () {
    await seedUsers();
    await seedAdmin();
    await seedTeams();
    await seedFixtures();
});
describe("Team", async () => {
    let user: any;
    let admin: any;
    beforeEach(async () => {
        user = await loginUser();
        admin = await loginAdmin();
    });

    describe("POST: create a team", () => {
        it("should create a new team when an authenticated admin try to create", (done) => {
            const team = {
                name: "this is a test",
                manager: "test",
                stadium: "dev",
                color: "white",
            };

            request(app)
                .post("/api/v1/teams")
                .set("Authorization", `bearer ${admin.body.data.token}`)
                .send(team)
                .expect(201)
                .expect((res) => {
                    expect(res.body.data).toHaveProperty("team");
                    expect(res.body.data.team).toHaveProperty("teamId");
                    expect(res.body.data.team.name).toBe(team.name);
                })
                .end(done);
        });

        it("should return 400 if required fields are missing", (done) => {
            const team = {};

            request(app)
                .post("/api/v1/teams")
                .set("Authorization", `bearer ${admin.body.data.token}`)
                .send(team)
                .expect(400)
                .end(done);
        });

        it("should not allow a non admin to create a new team", (done) => {
            const team = {
                name: "this is a test",
                manager: "test",
                stadium: "dev",
                color: "white",
            };

            request(app)
                .post("/api/v1/teams")
                .set("Authorization", `bearer ${user.body.data.token}`)
                .send(team)
                .expect(401)
                .end(done);
        });
    });

    describe("GET Team", () => {
        it("should return a team created by an admin to the user", (done) => {
            request(app)
                .get(`/api/v1/teams/${teams[1].teamId}`)
                .set("Authorization", `bearer ${user.body.data.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.team.teamId).toBe(teams[1].teamId);
                })
                .end(done);
        });

        it("should return all teams to a User", (done) => {
            request(app)
                .get("/api/v1/teams/")
                .set("Authorization", `bearer ${user.body.data.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.result).toHaveLength(3);
                })
                .end(done);
        });

        it("should return a team to an admin when the team Id and admin auth is passed", (done) => {
            request(app)
                .get(`/api/v1/admin/team/${teams[1].teamId}`)
                .set("Authorization", `bearer ${admin.body.data.token}`)
                .expect(200)
                .end(done);
        });

        it("should return all teams when an admin auth token is passed", (done) => {
            request(app)
                .get("/api/v1/admin/teams")
                .set("Authorization", `bearer ${admin.body.data.token}`)
                .expect(200)
                .end(done);
        });
    });

    describe("Update Team", () => {
        it("should update a team", (done) => {
            const update = {
                nickname: "boys boys",
            };
            request(app)
                .put(`/api/v1/teams/${teams[1].teamId}`)
                .set("Authorization", `bearer ${admin.body.data.token}`)
                .send(update)
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.team.meta.nickname).toBe(update.nickname);
                })
                .end(done);
        });

        it("should not allow a user to update a team", (done) => {
            const update = {
                nickname: "boys boys",
            };
            request(app)
                .put(`/api/v1/teams/${teams[1].teamId}`)
                .set("Authorization", `bearer ${user.body.data.token}`)
                .send(update)
                .expect(401)
                .end(done);
        });
    });

    describe("Remove Team", () => {
        it("should allow an admin remove a team", (done) => {
            request(app)
                .delete(`/api/v1/teams/${teams[2].teamId}`)
                .set("Authorization", `bearer ${admin.body.data.token}`)
                .expect(200)
                .end(done);
        });

        it("should not allow a user remove a team", (done) => {
            request(app)
                .delete(`/api/v1/teams/${teams[2].teamId}`)
                .set("Authorization", `bearer ${user.body.data.token}`)
                .expect(401)
                .end(done);
        });
    });

    describe("SEARCH", () => {
        it("should be able to search", (done) => {
            request(app)
                .get(`/api/v1/search?search=abuja`)
                .expect(200)
                .end(done);
        });
    });
});
async function loginUser() {
    return request(app).post("/api/v1/login").send({
        email: users[0].email,
        password: users[0].password,
    });
}
async function loginAdmin() {
    return request(app).post("/api/v1/admin/login").send({
        email: admin[1].email,
        password: admin[1].password,
    });
}
