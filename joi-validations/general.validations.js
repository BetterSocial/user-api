const Joi = require('joi');

/** Joi schema */
const string = Joi.string().trim();
const uuid = string.uuid();
const number = Joi.number();
const url = string.uri().trim();
const boolean = Joi.boolean();
const dateIso = Joi.date().iso();
const array = (item) => Joi.array().items(item);
const object = (keys) => Joi.object().keys(keys);

module.exports = {
  string,
  url,
  number,
  boolean,
  dateIso,
  uuid,
  array,
  object
};
