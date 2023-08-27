const fs = require('fs');
const path = require('path');

const { getGameData } = require('./GameData.js');
const { log, warn, error } = require('./log.js');
const { drawImage } = require('pdf-lib');

const { getLogoPath, getLogoProfile } = require('./cls/LogoProfile.js');
// const { getPortrait, getPortraitProfile } = require('./cls/PortraitProfile.js');


async function writeLogo(doc, pageInfo) {
  let profile = getLogoProfile(pageInfo);

  if (profile != null) {
    const logoPath = getLogoPath(doc.settings);
    const imageBytes = fs.readFileSync(logoPath);
    const logoImage = await doc.document.embedPng(imageBytes);
    
    let dims = profile.scale(logoImage);
    doc.canvas.drawImage(logoImage, dims);
  }
}

async function writePortrait(doc, pageInfo) {

}

module.exports = {
  writeLogo,
  writePortrait
}
