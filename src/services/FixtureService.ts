/**
 * FixtureService object.
 * handles business logic relating to FixtureModel
 */
import { FixtureModel } from "../models/fixture";

const FixtureService = {
    async createFixture(data: any) {
        try {
            const fixture = new FixtureModel(data);
            await fixture.save();

            return fixture;
        } catch (error) {
            throw error;
        }
    },

    async checkAvailabityOfTeam(id: string, kickOff: string) {
        try {
            const k = new Date(kickOff);
            k.setDate(k.getDate() - 0);
            const home = await FixtureModel.find({
                home: id,
                kickOff: {
                    $gte: k,
                    $lt: k,
                },
            });
            const away = await FixtureModel.find({
                away: id,
                kickOff: {
                    $gte: k,
                    $lt: k,
                },
            });

            const result = home.length > 0 || away.length > 0 ? true : false;

            return result;
        } catch (error) {
            throw error;
        }
    },



    async findFixturesByStatus(status: string) {
        try {
            const fixtures = await FixtureModel.find({ status })
                .populate({ path: "home", select: "name" })
                .populate({ path: "away", select: "name" })
                .sort({ created_at: -1 });
            return fixtures;
        } catch (error) {
            throw error;
        }
    },

    async findFixtureByMongoId(id: string) {
        try {
            const fixture = await FixtureModel.findOne({
                _id: id,
                isDeleted: false,
            })
                .populate({ path: "home", select: "name" })
                .populate({ path: "away", select: "name" });
            return fixture;
        } catch (error) {
            throw error;
        }
    },

    async findFixtureById(fixtureId: string) {
        try {
            const fixture = await FixtureModel.findOne({
                fixtureId,
                isDeleted: false,
            })
                .populate({ path: "home", select: "name" })
                .populate({ path: "away", select: "name" });
            return fixture;
        } catch (error) {
            throw error;
        }
    },

    async findFixtures(query: any) {
        try {
            const fixtures = await FixtureModel.find({
                status: {
                    $in: query.status,
                },
                createdAt: {
                    $gte: new Date(query.startDate),
                    $lt: new Date(query.endDate),
                },
                isDeleted: false
            })
                .populate({ path: "home", select: "name" })
                .populate({ path: "away", select: "name" })
                .sort({ createdAt: -1 });
            return fixtures;
        } catch (error) {
            throw error;
        }
    },

    async updateFixture(fixtureId: string, data: any) {
        try {
            const fixture = await FixtureModel.findOneAndUpdate(
                { fixtureId },
                { $set: data },
                { new: true }
            )
                .populate({ path: "home", select: "name" })
                .populate({ path: "away", select: "name" });
            return fixture;
        } catch (error) {
            throw error;
        }
    },

    async removeFixture(fixtureId: string) {
        try {
            const fixture = await FixtureModel.findOneAndUpdate({ fixtureId }, { isDeleted: true });
            return fixture;
        } catch (error) {
            throw error;
        }
    },

    async checkPendingFixture(fixtureId: string) {
        try {
            const fixture = await FixtureModel.findOne({
                fixtureId,
                status: "pending",
            });
            return fixture;
        } catch (error) {
            throw error;
        }
    },

    async search(str: string) {
        try {
            const result = await FixtureModel.find({
                $or: [
                    {
                        venue: {
                            $regex: str,
                            $options: 'i',
                        },
                    },
                ],
            })
                .populate('home')
                .populate('away');
            return result;
        } catch (error) {
            throw error;
        }
    }
};


export default FixtureService;
