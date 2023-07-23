
const { log } = require('./log.js');
const { t } = require('./i18n.js');

async function writeCopyright(doc, page, pageInfo, settings) {
  log("copyright", "Writing copyright", pageInfo);
}

module.exports = {
  writeCopyright
}
