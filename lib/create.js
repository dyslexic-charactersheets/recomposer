const { log } = require('./log.js');
const { inferPages, inferSettings } = require('./cls/GameData.js');
const { has } = require('./util.js');
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
            filename: character.filename(), // createFilename(character),
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

// function createFilename(character) {
//   log("create", "Filename? Character", character);

//   switch (character.primary.type) {
//     case "gm":
//       return "GM.pdf";
//     case "starship":
//       return "Starship.pdf";
//   }

//   let classes = (has(character.primary.attributes, "classes") && Array.isArray(character.primary.attributes.classes)) ? character.primary.attributes.classes : [];

//   log("create", "Filename? Classes", classes);

//   if (classes.length == 0) {
//     return "Generic.pdf";
//   }
//   return classes.map((cls) => {
//     if (Array.isArray(cls)) {
//       cls = cls[0];
//     }
//     return cls;
//   }).join(", ")+".pdf";
// }

module.exports = {
  createCharacterSheet
}
