const fs = require('fs');
const path = require('path');
const { rgb, BlendMode } = require('pdf-lib');
const { log, error } = require('./log.js');

class GameData {
  constructor(data) {
    this.data = JSON.parse(data);
  }

  // get a class's data
  getClassInfo(className) {
    return this.data.classes.filter((cls) => cls.name == className)[0];
  }

  // Get a page for a given slot and optionally variant
  getPage(slot, variant = null) {
    if (variant !== null) {
      let pages = this.data.pages.filter((page) => page.slot == slot && page.variant == variant);
      if (pages.length > 0) {
        return pages[0];
      }
    }

    let pages = this.data.pages.filter((page) => page.slot == slot);
    if (pages.length > 0) {
      return pages[0];
    }
    return null;
  }

  inferPages(primary) {
    let gameData = systemGameData[primary.attributes.game];
  
    let pages = [];
  
    for (let page of gameData.data.base.pages) {
      pages.push(gameData.getPage(page));
    }
  
    for (let cls of primary.attributes.classes) {
      cls = gameData.getClassInfo(cls);
      log("GameData", "Class", cls);
      for (let page of cls.pages) {
        pages.push(gameData.getPage(page));
      }
    }
  
    return pages;
  }

  getSkillInfo(skillName) {
    return this.data.skills.filter((skill) => skill.name == skillName)[0];
  }

  // Find the skills for various selected classes
  getSkills(pageInfo, settings) {
    let skills = {};
    let self = this;

    function addSkills(skillNames) {
      // log("GameData", "Skill names", skillNames);
      if (skillNames === null) {
        return;
      }
      for (let skillName of skillNames) {
        let skill = self.getSkillInfo(skillName);
        if (skill != null) {
          skills[skillName] = skill;
        }
      }
    }

    switch (pageInfo.slot) {
      case "core":
        // find all the skills
        addSkills(this.data.coreSkills);
        for (let className of settings.classes) {
          let cls = this.getClassInfo(className);
          log("GameData", "Skills for class", className, cls.skills);
          if (cls != null) {
            addSkills(cls.skills);
          }
        }
        break;

      // pathfinder
      case "eidolon":
        let eidolon = this.getClassInfo("Eidolon");
        if (eidolon != null) {
          addSkills(eidolon.skills);
        }
        break;

      case "spiritualist-phantom":
        let phantom = this.getClassInfo("Phantom");
        if (phantom != null) {
          addSkills(phantom.skills);
        }

      case "animalcompanion":
        addSkills(this.data.animalSkills);
        break;

      // starfinder
      case "drone":
        addSkills(this.data.droneSkills);
        break;
    }


    return Object.values(skills);
  }
}

log("gamedata", "Loading game data");
let systemGameData = {
  pathfinder: new GameData(fs.readFileSync('../assets/data/pathfinder.json')),
  starfinder: new GameData(fs.readFileSync('../assets/data/starfinder.json')),
  dnd35: new GameData(fs.readFileSync('../assets/data/dnd35.json')),
}

function getGameData(game) {
  if (!systemGameData.hasOwnProperty(game)) {
    error("GameData", "System not found:", game);
  }
  return systemGameData[game];
}

function interpretColour(colour) {
  switch (colour) {
    case "light": return rgb(0.3, 0.3, 0.3);
    case "dark": return rgb(0.35, 0.35, 0.35);
    case "black": return rgb(0, 0, 0);
    case "red": return rgb(0.6, 0.2, 0.2);
    case "orange": return rgb(0.72, 0.47, 0.30);
    case "yellow": return rgb(1.0, 0.92, 0.55);
    case "lime": return rgb(0.77, 0.85, 0.55);
    case "green": return rgb(0.5, 0.7, 0.5);
    case "cyan": return rgb(0.6, 0.75, 0.75);
    case "blue": return rgb(0.55, 0.63, 0.80);
    case "purple": return rgb(0.80, 0.6, 0.70);
    case "pink": return rgb(1.0, 0.60, 0.65);
    default: return rgb(0.3, 0.3, 0.3);
  }
}

function interpretColourMode(colour) {
  switch (colour) {
    case "light": return BlendMode.Screen;
    case "dark": return BlendMode.Overlay;
    case "black": return BlendMode.ColorBurn;
    default: return BlendMode.Overlay;
  }
}

function inferSettings(primary) {
  let attrs = {
    id: primary.id,
    game: 'pathfinder',
    language: 'english',
    printColour: 'gray',
    ...primary.attributes,
  }

  let settings = {
    game: attrs.game,
    isPathfinder: attrs.game == "pathfinder",
    isStarfinder: attrs.game == "starfinder",
    isDnD35: attrs.game == "dnd35",
    isBarbarian: false,
    language: attrs.language,
    colour: interpretColour(attrs.printColour),
    colourMode: interpretColourMode(attrs.printColour),
    ...attrs,
  };

  return settings;
}

function locatePage(pageInfo, settings) {
  let game = settings.game;
  let language = settings.language;

  let file = path.resolve(`../assets/${language == 'english' ? '' : `languages/${language}/`}${game}/${pageInfo.file}`);
  log("GameData", "Locate file", file);
  return file;
}

module.exports = {
  GameData,
  getGameData,
  inferSettings,
  locatePage
};
