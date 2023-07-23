/**
 * Dyslexic Character Sheets recomposer
 * @module dyslexic-charactersheets
 */

const parse = require('./lib/parse.js');

const create = require('./lib/create.js');

module.exports = {
  parseFormFields: parse.parseFormFields,
  createCharacterSheet: create.createCharacterSheet
};
