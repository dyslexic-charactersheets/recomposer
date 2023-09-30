const { log } = require('../log.js');
const { Document } = require('./Document.js');
const { has } = require('../util.js');

class Character {
  constructor(primary) {
    this.primary = primary;
  }

  option(name) {
    log("Character", "option", name, this.primary[name])
    return has(this.primary.attributes, name) && this.primary.attributes[name];
  }

  async create() {
    log("Character", "Create character sheet", this.primary);
    let doc = await Document.create(this.primary);

    if (this.option("permission")) {
      await doc.addPage(doc.gameData.getPage("permission"));
    }

    if (this.option("buildMyCharacter")) {
      await doc.addPage(doc.gameData.getPage("build"));
    }

    let classPages = doc.gameData.inferClassPages(this.primary);
    doc.classPages = classPages;
    for (let pageInfo of classPages) {
      await doc.addPage(pageInfo);
    }

    if (this.option("optionBackground")) {
      await doc.addPage(doc.gameData.getPage("background"));
    }

    if (this.option("includeLycanthrope")) {
      await doc.addPage(doc.gameData.getPage("lycanthrope"));
    }

    if (this.option("includeIntelligentItem")) {
      await doc.addPage(doc.gameData.getPage("intelligent-item"));
    }

    if (this.option("includePartyFunds")) {
      await doc.addPage(doc.gameData.getPage("partyfunds"));
    }

    if (this.option("includeAnimalCompanion")) {
      await doc.addPage(doc.gameData.getPage("animalcompanion"));

      if (this.option("hasAnimalIconic")) {
        await doc.addPage(doc.gameData.getPage("mini-animal"));
      }
    }

    if (this.option("includeMini")) {
      await doc.addPage(doc.gameData.getPage("mini"));
    }

    let bytes = await doc.finishDocument();
    return bytes;
  }
}

module.exports = {
  Character
}
