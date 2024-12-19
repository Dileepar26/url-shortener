const Joi = require('joi');

const validateCreateShortUrl = (obj) => {
    const JoiSchema = Joi.object({
        longUrl: Joi.string().uri().required(),
        customAlias: Joi.string().min(1).max(255),
        topic: Joi.string().min(1).max(255)
    })
    const { error } = JoiSchema.validate(obj)
    if (error) return error.details[0].message
}

module.exports = {
    validateCreateShortUrl
}