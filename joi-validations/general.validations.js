const Joi = require('joi');

/** Joi schema */
const string = Joi.string().trim();
const number = Joi.number();
const boolean = Joi.boolean();
const dateIso = Joi.date().iso();
const array = (item) => Joi.array().items(item);
const object = (keys) => Joi.object().keys(keys);

module.exports = {
  string,
  number,
  boolean,
  dateIso,
  array,
  object
};
