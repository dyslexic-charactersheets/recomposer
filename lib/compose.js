const fs = require('fs');
const { BlendMode, PDFDocument, rgb } = require('pdf-lib');

const gamedata = require('./gamedata.js');
const { writeSkills } = require('./skills.js');
const { writeCopyright } = require('./copyright.js');
const { log } = require('./log.js');

async function createDocument() {
  const pdfDoc = await PDFDocument.create();
  return pdfDoc;
}

async function addPage(doc, pageInfo, settings) {
  doc = await doc;

  let pageFile = gamedata.locatePage(pageInfo, settings);
  const inDocBytes = fs.readFileSync(pageFile);
  
  let [inPage] = await doc.embedPdf(inDocBytes);
  let inPageDims = inPage.scale(1);
  
  let canvas = doc.addPage();

  // fill in the backdrop with white
  canvas.drawRectangle({
    x: 0, y: 0,
    width: inPageDims.width,
    height: inPageDims.height,
    color: rgb(1, 1, 1)
  });

  // draw the actual page
  canvas.drawPage(inPage, {
    ...inPageDims,
    x: 0, y: 0
  });

  // draw other elements
  writeCopyright(doc, canvas, pageInfo, settings);

  writeSkills(doc, canvas, pageInfo, settings);


  // apply the colour overlay
  canvas.drawRectangle({
    x: 0, y: 0,
    width: inPageDims.width,
    height: inPageDims.height,
    color: settings.colour,
    blendMode: settings.colourMode
  });

  // draw other elements


  return doc;
}

async function finishDocument(doc) {
  doc = await doc;

  const pdfBytes = await doc.save();
  return pdfBytes;
}

module.exports = {
  createDocument, addPage, finishDocument
}
