const Joi = require('joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        repeatPassword: Joi.ref('password')
    });
    return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
};

const updateUserValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(30).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).optional().allow('')
    });
    return schema.validate(data);
};


module.exports = {
    registerValidation,
    loginValidation,
    updateUserValidation
};