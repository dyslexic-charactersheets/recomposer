const fs = require('fs');
const path = require('path');

const { drawImage, PDFFont } = require('pdf-lib');

const { getGameData } = require('./cls/GameData.js');
const { log, warn, error } = require('./log.js');
const { isEmpty, has } = require('./util.js');

const { getLogoPath, getLogoProfile } = require('./cls/LogoProfile.js');
const { getPortraitPath, getPortraitProfile } = require('./cls/PortraitProfile.js');


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
  if (isEmpty(doc.settings.inventoryIconic)) {
    return;
  }

  let profile = getPortraitProfile(pageInfo, doc.settings);
  if (profile) {
    // DEBUG!
    doc.canvas.drawRectangle({
      x: profile.x - (profile.width / 2),
      y: profile.y - (profile.height / 2),
      width: profile.width,
      height: profile.height,
      borderWidth: 0.5,
      borderColor: doc.textColour,
      color: doc.textColour,
      // opacity: 0.5,
      // borderOpacity: 0.75,
      opacity: 0.2,
      borderOpacity: 0.5,
    });

    let imageBytes = null;
    const iconicPath = getPortraitPath(doc.settings);
    if (iconicPath !== null) {
      imageBytes = fs.readFileSync(iconicPath);
    } // else ... blob images

    if (imageBytes != null) {
      const image = await doc.document.embedPng(imageBytes);
      let dims = profile.scale(image);
      doc.canvas.drawImage(image, dims);
    }

  }
}

module.exports = {
  writeLogo,
  writePortrait
}
