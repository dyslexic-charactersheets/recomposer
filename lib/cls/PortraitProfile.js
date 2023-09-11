const fs = require('fs');
const path = require('path');

const { log, error } = require('../log.js');
const { getAssetPath, loadAsset } = require('../assets.js');
const { has, isEmpty } = require('../util.js');

class PortraitProfile {
  constructor(args) {
    Object.assign(this, {
      ...args
    });
  }

  scale(image) {
    let dims = image.scaleToFit(this.width, this.height);
    
    return {
      x: this.x - (dims.width / 2),
      y: this.y - (dims.height / 2),
      width: dims.width,
      height: dims.height
    };
  }
}

function getPortraitProfile(pageInfo, settings) {
  switch (pageInfo.slot) {
    case "core":
      if (settings.isStarfinder) {
        return new PortraitProfile({
          x: 127,
          y: 462,
          width: 180,
          height: 215
        });
      }
      break;

    case "inventory":
      return new PortraitProfile({
        x: 315,
        y: 522,
        width: 180,
        height: 215
      });

    case "background":
      return new PortraitProfile({
        x: 127,
        y: 425,
        width: 180,
        height: 215
      });

    case "mini":
      // ... whoa nelly ...
  }
  return false;
}

let iconicFiles = {};
(() => {
  let indexPath = getAssetPath("iconics/iconics.txt");
  fs.readFile(indexPath, 'utf-8', (err, data) => {
    if (err) {
      error("PortraitProfile", "Error reading iconic info", err);
      return;
    }
    let lines = data.split(/\n/);
    lines[0]
    for (let line of lines) {
      let [code, name] = line.split(/=/, 2);
      let assetCode = code.replaceAll('/', '-');
      let assetPath = getAssetPath('iconics/large/'+code+'.png');
      // log("PortraitProfile", `Iconic [${assetCode}] [${assetPath}]`);
      if (assetCode != "") {
        iconicFiles[assetCode] = assetPath;
      }
    }
    log("PortraitProfile", `Read ${Object.keys(iconicFiles).length} iconics`);
  });
})();

function getPortraitPath(settings) {
  if (has(settings, "inventoryIconic")) {
    log("PortraitProfile", "Looking for iconic", settings.inventoryIconic);
    if (has(iconicFiles, settings.inventoryIconic)) {
      log("PortraitProfile", "Found", iconicFiles[settings.inventoryIconic]);
      return iconicFiles[settings.inventoryIconic];
    }
  }
  return null;
}

module.exports = {
  PortraitProfile,
  getPortraitPath,
  getPortraitProfile
}
