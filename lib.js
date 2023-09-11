/**
 * Dyslexic Character Sheets recomposer
 * @module dyslexic-charactersheets
 */

const { createCharacterSheet } = require('./lib/create.js');

const { setAssetDir } = require('./lib/assets.js');

module.exports = {
  setAssetDir,
  createCharacterSheet
};
