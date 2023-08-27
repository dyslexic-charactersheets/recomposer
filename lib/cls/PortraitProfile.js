const { log, error } = require('../log.js');

class PortraitProfile {
  constructor(args) {
    Object.assign(this, {
      // defaults
      
      ...args
    });
  }
}

function getPortraitProfile(pageInfo, settings) {
  return false;
}
