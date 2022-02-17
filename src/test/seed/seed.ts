import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { UserModel } from "./../../models/user";
import { AdminModel } from "./../../models/admin";
import { TeamModel } from "../../models/team";
import { FixtureModel } from "../../models/fixture";
import Utils from "../../utils/utils";

const users = [
    {
        _id: new ObjectId(),
        name: "Jane Doe",
        email: "dummy1@mail.com",
        password: "password",
    },
    {
        name: "Rex Fox",
        email: "dummy@example.com",
        password: "password",
    },
];
const admin = [
    {
        name: "John Doe",
        email: "john@mail.com",
        password: "password",
        role: "root",
    },
    {
        _id: new ObjectId(),
        name: "Jane Doe",
        email: "dummy@example.com",
        password: "password",
        role: "root",
    },
];
const fOne = new ObjectId();
const fTwo = new ObjectId();

const teams = [
    {
        _id: new ObjectId(),
        name: "Enyimba",
        manager: "pep",
        stadium: "aba",
        color: "blue",
        meta: {
            nickname: "people's elephant",
            fixtures: [fOne],
        },
        creator: admin[1]._id,
        teamId: uuidv4(),
    },
    {
        _id: new ObjectId(),
        name: "juventus",
        manager: "siasia",
        stadium: "turin",
        color: "white and black",
        meta: {
            nickname: "old ladies",
            fixtures: [fOne, fTwo],
        },
        creator: admin[1]._id,
        teamId: uuidv4(),
    },
    {
        _id: new ObjectId(),
        name: "ojudu fc",
        manager: "ferguson",
        stadium: "abuja",
        color: "red",
        meta: {
            nickname: "",
            fixtures: [fTwo],
        },
        creator: admin[1]._id,
        teamId: uuidv4(),
    },
];

const fOneId = uuidv4();
const fTwoId = uuidv4();
const fixtures = [
    {
        _id: fOne,
        home: teams[0]._id,
        away: teams[1]._id,
        kickOff: new Date("2020-09-24"),
        status: "pending",
        report: {
            scores: {
                home: 0,
                away: 0,
            },
        },
        venue: teams[0].stadium,
        fixtureId: fOneId,
        link: Utils.generateFixtureLink(fOneId),
    },
    {
        _id: fTwo,
        home: teams[2]._id,
        away: teams[1]._id,
        kickOff: new Date("2020-09-31"),
        status: "completed",
        report: {
            scores: {
                home: 1,
                away: 1,
            },
        },
        fixtureId: fTwoId,
        venue: teams[2].stadium,
        link: Utils.generateFixtureLink(fTwoId),
    },
];

const seedUsers = async () => {
    try {
        await UserModel.deleteMany({});
        const u1 = new UserModel(users[0]);
        await u1.save();
        const u2 = new UserModel(users[1]);
        await u2.save();
    } catch (error) {
        console.log("SEED", error);
    }
};

const seedAdmin = async () => {
    try {
        await AdminModel.deleteMany({});
        const a1 = new AdminModel(admin[0]);
        await a1.save();
        const a2 = new AdminModel(admin[1]);
        await a2.save();
    } catch (error) {
        console.log("SEED", error);
    }
};

const seedTeams = async () => {
    try {
        await TeamModel.deleteMany({});
        await TeamModel.insertMany(teams);
    } catch (error) {
        console.log("SEED", error);
    }
};

const seedFixtures = async () => {
    try {
        await FixtureModel.deleteMany({});
        await FixtureModel.insertMany(fixtures);
    } catch (error) {
        console.log("SEED", error);
    }
};
export {
    users,
    seedUsers,
    admin,
    seedAdmin,
    teams,
    seedTeams,
    fixtures,
    seedFixtures,
};
