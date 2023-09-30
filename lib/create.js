const { log } = require('./log.js');
const { inferPages, inferSettings } = require('./cls/GameData.js');
// const compose = require('./compose.js');
const { Document } = require('./cls/Document.js');
const { Character } = require('./cls/Character.js');
const { GM } = require('./cls/GM.js');
const { Starship } = require('./cls/Starship.js');

function createCharacterSheet(request) {
  return new Promise((resolve, reject) => {
    try {
      let character = interpretPrimary(request.data);

      character.create()
        .then((bytes) => {
          resolve({
            data: bytes,
            filename: createFilename(character),
          });
        })
        .catch((e) => {
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  });
}

function interpretPrimary(primary) {
  switch (primary.type) {
    case "character":
      return new Character(primary);
    case "gm":
      return new GM(primary);
    case "starship":
      return new Starship(primary);
  }
}

function createFilename(character) {
  return character.primary.attributes.classes.map((cls) => {
    if (Array.isArray(cls)) {
      cls = cls[0];
    }
    return cls;
  }).join(", ")+".pdf";
}

module.exports = {
  createCharacterSheet
}
