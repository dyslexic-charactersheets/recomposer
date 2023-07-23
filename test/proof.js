import { BlendMode, PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'

async function createPdf() {
  const inDocBytes = fs.readFileSync('test/in.pdf')

  const pdfDoc = await PDFDocument.create()

  // const inDoc = await PDFDocument.load(existingPdfBytes)
  // let [inPage] = await pdfDoc.copyPages(inDoc, [0])
  let [inPage] = await pdfDoc.embedPdf(inDocBytes);
  // let [inPage] = await pdfDoc.embedPage(inDoc.getPages()[1])
  let inPageDims = inPage.scale(1)


  let page = pdfDoc.addPage(inPageDims.width, inPageDims.height)
  page.drawRectangle({
    x: 0, y: 0,
    width: inPageDims.width,
    height: inPageDims.height,
    color: rgb(1, 1, 1)
  })
  page.drawPage(inPage, {
    ...inPageDims,
    x: 0, y: 0
  })
  page.drawRectangle({
    x: 0, y: 0,
    width: inPageDims.width,
    height: inPageDims.height,
    color: rgb(0.4, 0.4, 0.8),
    blendMode: BlendMode.Overlay
  })

  const pdfBytes = await pdfDoc.save()

  fs.writeFile('test/out.pdf', pdfBytes, (err) => {
    if (err) {
      console.log("Error:", err);
    }
  })
}

createPdf();
