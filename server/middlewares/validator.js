const Joi = require('joi')

const signUpSchema = Joi.object({
     firstName: Joi.string()
     .required()
      .trim()
      .min(2)
      .max(50)
      .messages({
        'string.empty': 'Please provide a first name',
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name must be at most 50 characters',
        'any.required': 'First name is required',
      }),
  lastName: Joi.string()
    .required()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Please provide a last name',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must be at most 50 characters',
      'any.required': 'Last name is required',
    }),
    username: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(30)
    .messages({
      'string.empty': 'Please provide a username',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must be at most 30 characters',
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net'] } }) // Restrict TLDs(Top-level DOmains to com and net)
    .required()
    .trim()
    .min(6)
    .max(50)
    .messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Please provide an email',
      'string.min': 'Email must be at least 6 characters',
      'string.max': 'Email must be at most 50 characters',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
    .messages({
      'string.pattern.base': 'Password must be at least 6 characters',
      'string.empty': 'Please provide a password',
      'any.required': 'Password is required',
    }),
  bio: Joi.string()
    .trim()
    .max(500)
    .messages({
      'string.max': 'Bio must be at most 500 characters',
    }),
})

const signInSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net'] } }) // Restrict TLDs(Top-level DOmains to com and net)
    .required()
    .trim()
    .min(6)
    .max(50)
    .messages({
      'string.email': 'Please provide a valid email',
      'string.empty': 'Please provide an email',
      'string.min': 'Email must be at least 6 characters',
      'string.max': 'Email must be at most 50 characters',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
    .messages({
      'string.pattern.base': 'Password must be at least 6 characters',
      'string.empty': 'Please provide a password',
      'any.required': 'Password is required',
    }),
});


const articleSchema = Joi.object({
  title: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(100)
    .messages({
      'string.empty': 'Please provide a title',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must be at most 100 characters',
      'any.required': 'Title is required',
    }),
  description: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(200)
    .messages({
      'string.empty': 'Please provide a description',
      'string.min': 'Description must be at least 3 characters',
      'string.max': 'Description must be at most 200 characters',
      'any.required': 'Description is required',
    }),
  body: Joi.string()
    .required()
    .trim()
    .min(10)
    .messages({
      'string.empty': 'Please provide a body',
      'string.min': 'Body must be at least 10 characters',
      'any.required': 'Body is required',
    }),
  tags: Joi.array()
    .items(Joi.string())
    .messages({
      'array.base': 'Tags must be an array',
      'any.required': 'Tags are required',
    }),
  readingTime: Joi.string()
    .required()
    .messages({
      'string.empty': 'Please provide a reading time',
      'any.required': 'Reading time is required',
    }),
})

module.exports = { signUpSchema, signInSchema, articleSchema }
