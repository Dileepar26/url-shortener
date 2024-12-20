const Joi = require('joi');

const validateGetUrlAnalytics = (obj) => {
    const JoiSchema = Joi.object({
        alias: Joi.string().min(1).max(255)
    })
    const { error } = JoiSchema.validate(obj)
    if (error) return error.details[0].message
}

const validateGetTopicAnalytics = (obj) => {
    const JoiSchema = Joi.object({
        topic: Joi.string().min(1).max(255)
    })
    const { error } = JoiSchema.validate(obj)
    if (error) return error.details[0].message
}

module.exports = {
    validateGetUrlAnalytics,
    validateGetTopicAnalytics
}