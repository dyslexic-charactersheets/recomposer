const fs = require('fs');
const { log, warn } = require('./log.js'); 

// load the 
const translations = (() => {
  let data = JSON.parse(fs.readFileSync('../assets/data/translations.json'));
  let translations = {};
  for (let lang of data.languages) {
    log("i18n", `Loaded ${lang.translations.length} ${lang.name} translations`);
    translations[lang.name] = {};
    for (let item of lang.translations) {
      translations[lang.name][item.original] = item.translation;
    }
  }
  log("i18n", `Loaded ${translations.length} translations`);
  return translations;
})();


function t(string, language) {
  if (language === null || language == "" || language == "english") {
    return string;
  }

  if (!translations.hasOwnProperty(language)) {
    warn("i18n", "Unknown language", language);
    return string;
  }

  if (!translations[language].hasOwnProperty(string)) {
    warn("i18n", `Unknown ${language} translation`, string);
    return string;
  }

  return translations[language][string];
}

module.exports = {
  t
}
