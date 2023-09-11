const fs = require('fs');
const path = require('path');

const { BlendMode, PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

const { getAssetPath, loadAsset, loadInternalAsset } = require('../assets.js');
const { getGameData, inferSettings, locatePage } = require('./GameData.js');
const { writeSkills } = require('../skills.js');
const { writeCopyright } = require('../copyright.js');
const { log, error } = require('../log.js');
const { writeLogo, writePortrait } = require('../pictures.js');
const { writeWatermark } = require('../watermark.js');
const { isEmpty } = require('../util.js');

class Document {
  // Constructor cannot be async, so use this method instead
  static async create(primary) {
    let doc = new Document();
    await doc.setup(primary);
    return doc;
  }

  async setup(primary) {
    // core data
    this.primary = primary;
    this.settings = inferSettings(primary);
    this.gameData = getGameData(this.settings.game);

    // create a document
    this.document = await PDFDocument.create();

    // embed fonts
    this.document.registerFontkit(fontkit)
    this.textFont = await this.addFont('Roboto-Condensed.ttf');
    this.textFontBold = await this.addFont('Roboto-BoldCondensed.ttf');
    
    if (this.settings.isStarfinder) {
      this.altFont = await this.addFont('Exo2-Bold.otf');
    } else {
      this.altFont = await this.addFont('Merriweather-Bold.ttf');
    }

    if (this.settings.isBarbarian) {
      this.barbarianFont = await this.addFont('dirty-duo.ttf');
    }

    // set up colours
    this.textColour = rgb(0.4, 0.4, 0.4);
    this.fillColour = rgb(0.6, 0.6, 0.6);
    this.white = rgb(1, 1, 1);
  }

  async addFont(filename) {
    log("Document", "Loading font:", filename);
    let data = loadInternalAsset(`fonts/${filename}`);
    let font = await this.document.embedFont(data);
    return font;
  }

  async addPage(pageInfo) {
    if (isEmpty(pageInfo)) {
      error("Document", "No page");
      return;
    }
    let pageFile = locatePage(pageInfo, this.settings);
    if (isEmpty(pageFile)) {
      error("Document", "Unknown page", pageInfo, pageFile);
      return;
    }
    const inDocBytes = fs.readFileSync(pageFile);
    
    let [inPage] = await this.document.embedPdf(inDocBytes);
    let inPageDims = inPage.scale(1);
    this.pageDims = inPageDims;
    // log("Document", "Page dimensions", pageInfo, inPageDims);
    
    this.canvas = this.document.addPage([inPageDims.width, inPageDims.height]);

    // fill in the backdrop with white
    this.canvas.drawRectangle({
      x: 0, y: 0,
      width: inPageDims.width,
      height: inPageDims.height,
      color: rgb(1, 1, 1)
    });

    // draw the actual page
    this.canvas.drawPage(inPage, {
      ...inPageDims,
      x: 0, y: 0
    });

    // draw other elements
    await writeCopyright(this, pageInfo);

    await writeSkills(this, pageInfo);

    await this.writePageOverlays(pageInfo);

    // apply the colour overlay
    log("Document", "Main colour:", this.settings.colour);
    this.canvas.drawRectangle({
      x: 0, y: 0,
      width: inPageDims.width,
      height: inPageDims.height,
      color: this.settings.colour,
      blendMode: this.settings.colourMode
    });

    // draw other elements
    await writeLogo(this, pageInfo);

    await writePortrait(this, pageInfo);

    await writeWatermark(this, pageInfo);
  }

  async writePageOverlays(pageInfo) {
    if (this.settings.game == "pathfinder") {
      if (pageInfo.slot == "fighter") {
        // let mathsPage = locatePazge({...});
        // this.canvas.drawPage(overlayPage);
      }
     
      // if (pageInfo.slot == "combat") {

      // }
    }
  }

  async overlayPage(pageInfo, overlay) {
    let pageFile = locatePage(pageInfo, this.settings);
    const inDocBytes = fs.readFileSync(pageFile);
    
    let [inPage] = await this.document.embedPdf(inDocBytes);
    let inPageDims = inPage.scale(1);
    this.pageDims = inPageDims;

  }
  
  async finishDocument() {
    const pdfBytes = await this.document.save();
    return pdfBytes;
  }
}

module.exports = {
  Document
}