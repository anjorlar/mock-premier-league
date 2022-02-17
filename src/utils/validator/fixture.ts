import Joi from "joi";

export const CreateFixtureSchema = Joi.object({
    home: Joi.string().required(),
    away: Joi.string().required(),
    kickOff: Joi.date().required(),
});

export const UpdateFixtureSchema = Joi.object({
    kickOff: Joi.date(),
    status: Joi.string(),
    scoreHome: Joi.number(),
    scoreAway: Joi.number(),
});
