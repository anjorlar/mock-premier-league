import Joi from "joi";

export const CreateTeamSchema = Joi.object({
    name: Joi.string().required(),
    manager: Joi.string().required(),
    color: Joi.string().required(),
    stadium: Joi.string().required(),
    nickname: Joi.string(),
});

export const UpdateTeamSchema = Joi.object({
    name: Joi.string(),
    manager: Joi.string(),
    color: Joi.string(),
    stadium: Joi.string(),
    nickname: Joi.string(),
});