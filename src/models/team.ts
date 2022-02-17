import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";

export interface TeamDoc extends Document {
    teamId: string;
    name: string;
    manager: string;
    color: string;
    stadium: string;
    meta: any;
}

const teamSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 1,
        },
        teamId: {
            type: String,
            required: true,
            unique: true,
        },
        manager: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
        stadium: {
            type: String,
            required: true,
        },
        meta: {
            nickname: {
                type: String,
            },
            fixtures: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "fixture",
                },
            ],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "admin",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

teamSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj._id;
    delete obj.isDeleted;
    return obj;
};

export const TeamModel: Model<TeamDoc> = model<TeamDoc>(
    config.mongoDb.collections.team,
    teamSchema
);
