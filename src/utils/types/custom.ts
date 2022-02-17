import { Request } from "express";

export interface IUser {
    name: string;
    email: string;
    password: string;
}

export interface IRequestUser extends Request {
    user?: {
        _id: string;
    };
}

export interface IRequestAdmin extends Request {
    user?: {
        _id: string;
        role?: string;
    };
}

export interface IAdmin {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface ITeam {
    teamId: string;
    name: string;
    manager: string;
    color: string;
    stadium: string;
    meta: any;
    createdBy?: string;
}
