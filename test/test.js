const fs = require('fs');

const { log, error } = require('../lib/log.js');
const { parseFormFields, createCharacterSheet } = require('../lib.js');

let indir = __dirname+'/in';
fs.readdir(indir, 'utf-8', (err, files) => {
  if (err) {
    console.log("ERROR:", err);
    return;
  }
  for (let file of files) {
    // log("test", "File", file);
    if (!file.match(/\.json$/)) {
      continue;
    }

    let filename = indir+'/'+file;
    log("test", "Reading", filename);
    
    fs.readFile(filename, 'utf-8', (err, fileData) => {
      if (err) {
        console.log(file, "ERROR:", err);
        return;
      }

      let data = JSON.parse(fileData);
      createCharacterSheet(data)
        .then((result) => {
          var outfile = __dirname+'/out/'+file.replace(/.json/, '')+'.pdf';
          fs.writeFile(outfile, result.data, (err) => {
            if (!!err) {
              error("test", err);
            } else {
              log("test", "Wrote", outfile);
            }
          });
        })
        .catch((x) => {
          error("test", x);
        });
    });
  }
});
