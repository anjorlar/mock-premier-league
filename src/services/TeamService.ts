/**
 * TeamService object.
 * handles business logic relating to TeamModel
 */
import { TeamModel } from "../models/team";
import { ITeam } from "../utils/types/custom";

const TeamService = {
    async createTeam(data: ITeam) {
        try {
            const team = new TeamModel(data);
            await team.save();

            return team;
        } catch (error) {
            throw error;
        }
    },

    async findTeamByName(name: string) {
        try {
            const team = await TeamModel.findOne({ name });

            return team;
        } catch (error) {
            throw error;
        }
    },

    async findTeamById(teamId: string) {
        try {
            const team = await TeamModel.findOne({
                teamId,
                isDeleted: false,
            })
                .populate({ path: "createdBy", select: "name" })
                .populate({ path: "meta.fixtures" });

            return team;
        } catch (error) {
            throw error;
        }
    },

    async getAllTeams() {
        try {
            const teams = await TeamModel.find({
                isDeleted: false,
            })
                .populate({ path: "createdBy", select: "name" })
                .sort({ createdAt: -1 });

            return teams;
        } catch (error) {
            throw error;
        }
    },

    async checkTeamById(teamId: string) {
        try {
            const team = await TeamModel.findOne({
                teamId,
                isDeleted: false,
            });
            return team;
        } catch (error) {
            throw error;
        }
    },

    async updateTeam(id: string, updateObject: any) {
        try {
            const teamUpdate = await TeamModel.findByIdAndUpdate(
                id,
                { $set: updateObject },
                { new: true }
            );
            return teamUpdate;
        } catch (error) {
            throw error;
        }
    },

    async updateTeamFixtures(id: string, updateObject: any) {
        try {
            const teamUpdate = await TeamModel.findByIdAndUpdate(
                id,
                { $set: { "meta.fixtures": updateObject } },
                { new: true }
            );
            return teamUpdate;
        } catch (error) {
            throw error;
        }
    },

    async removeTeam(teamId: string) {
        try {
            const teamUpdate = await TeamModel.findOneAndUpdate(
                { teamId },
                {
                    isDeleted: true,
                }
            );

            return teamUpdate;
        } catch (error) {
            throw error;
        }
    },

    async search(str: string) {
        try {
            const result = await TeamModel.find({
                $or: [
                    {
                        name: {
                            $regex: str,
                            $options: "i",
                        },
                    },
                    {
                        stadium: {
                            $regex: str,
                            $options: "i",
                        },
                    },
                    {
                        manager: {
                            $regex: str,
                            $options: "i",
                        },
                    },
                ],
            })
                //.populate("meta.fixtures")
                .populate({
                    path: 'meta.fixtures'
                })
                .exec();

            return result;
        } catch (error) {
            throw error;
        }
    },
};

export default TeamService;
