import { Document, Model, model, Schema } from "mongoose";
import { config } from "../config/config";
import jwt from "jsonwebtoken";
import utils from "../utils/utils";
export interface AdminDoc extends Document {
    _id: string;
    name: string;
    email: string;
    role: string;
    password: string;
    isDeleted: boolean;
    generateAuthToken: Function;
}

const adminSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 5,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            minlength: 5,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            require: true,
            minlength: 6,
            trim: true,
        },
        role: {
            type: String,
            require: true,
            enum: ["root", "super"],
            default: "root",
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

adminSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj._id;
    return obj;
};

adminSchema.pre("save", async function (next) {
    const admin = this;

    if (admin.isModified("password")) {
        const hashed = await utils.hashPassword(admin.get("password"));
        admin.set("password", hashed);
    }
    next();
});

adminSchema.methods.generateAuthToken = function () {
    const tokenData = {
        id: this._id,
    };
    const token = jwt.sign(tokenData, config.jwt.SECRETKEY, {
        subject: config.appName,
        algorithm: config.jwt.alg,
        expiresIn: config.jwt.expires,
        issuer: config.jwt.issuer,
    });
    return token;
};

export const AdminModel: Model<AdminDoc> = model<AdminDoc>(
    config.mongoDb.collections.admin,
    adminSchema
);
