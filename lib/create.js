const { log } = require('./log.js');
const { inferPages, inferSettings } = require('./GameData.js');
// const compose = require('./compose.js');
const { Document } = require('./Document.js');


async function compose(primary) {
  let doc = await Document.create(primary);

  let pages = doc.gameData.inferPages(primary);
  for (let pageInfo of pages) {
    await doc.addPage(pageInfo);
  }

  let bytes = await doc.finishDocument();
  return bytes;
}

function createCharacterSheet(request) {
  return new Promise((resolve, reject) => {
    try {
      log("create", "Create character sheet:", request.data.attributes.name);
      compose(request.data)
        .then((bytes) => {
          resolve(bytes);
        })
        .catch((e) => {
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  createCharacterSheet
}
