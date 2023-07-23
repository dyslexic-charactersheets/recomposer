// const { StandardFonts, rgb } = require('pdf-lib');

const { inferSkills, getGameData } = require('./GameData.js');
const { log } = require('./log.js');
const { t } = require('./i18n.js');
const { getSkillsProfile } = require('./SkillsProfile.js');

async function writeSkills(doc, pageInfo) {
  let skills = doc.gameData.getSkills(pageInfo, doc.settings);
  if (skills.length == 0) {
    return;
  }

  let profile = getSkillsProfile(pageInfo, doc.settings);
  if (profile == null) {
    return;
  }

  log("skills", "Writing skills", skills);

  // pull out the subskills
  let topSkills = [];
  let subskillsBySkill = {};
  for (let skill of skills) {
    if (skill.hasOwnProperty('subSkillOf') && skill.subSkillOf) {
      if (!subskillsBySkill.hasOwnProperty(skill.subSkillOf)) {
        subskillsBySkill[skill.subSkillOf] = [];
      }
      subskillsBySkill[skill.subSkillOf].push(skill);
    } else {
      topSkills.push(skill);
    }
  }
  
  // write a skill line
  async function drawCheckbox(pos, left, checked) {
    let baseline = profile.firstLine + pos * profile.lineIncrement;
    await doc.canvas.writeRectangle({
      x: left,
      y: baseline,
      width: 4.8,
      height: 4.8,
      rotate: degrees(-15),
      borderWidth: 1,
      borderColor: doc.textColour,
      color: checked ? doc.textColour : doc.white,
      opacity: 0.5,
      borderOpacity: 0.75,
    });
  }

  async function drawSubskillCurve(pos) {
    let baseline = profile.firstLine + pos * profile.lineIncrement;
    let lineleft = profile.skillsAreaLeft + 7;

    doc.canvas.drawLine({
      start: { x: lineleft, y: baseline + },
      end: { x: lineleft, y: baseline + },
    });
    doc.canvas
  }

  async function writeSkillLine(pos, skill, isSubskill) {
    let baseline = profile.firstLine + pos * profile.lineIncrement;
    let left = profile.skillsAreaLeft;

    if (isSubskill) {
      drawSubskillCurve(pos);
    }

    await doc.canvas.drawText(t(skill.name, doc.settings.language), {
      x: profile.skillNameLeft,
      y: baseline,
      font: doc.textFont,
      size: 8,
      color: doc.textColour,
    });
  }

  // draw a line between core and extra skills
  async function drawFold(pos) {
    let liney = profile.firstLine + (pos - 1) * profile.lineIncrement + profile.lineBottomOffset;

    doc.canvas.drawLine({
      start: { x: profile.skillsAreaLeft, y: liney },
      end: { x: profile.skillsAreaRight, y: liney },
      thickness: 1,
      color: doc.textColour,
      opacity: 1,
    });
  }

  // do it!
  let pos = 0;
  let foldWritten = false;
  for (let skill of topSkills) {
    if (skill.afterFold && !foldWritten) {
      drawFold(pos);
      foldWritten = true;
    }

    writeSkillLine(pos, skill, false);
    pos++;

    if (subskillsBySkill.hasOwnProperty(skill.name)) {
      for (let subskill of subskillsBySkill[skill.name]) {
        writeSkillLine(pos, subskill, true);
        pos++;
      }
    }
  }

  // fill in the blanks
  while (pos < profile.numSlots) {
    writeCheckbox(pos, profile.useUntrainedMiddle, false);
    writeCheckbox(pos, profile.classSkillMiddle, false);
    pos++;
  }
}

module.exports = {
  writeSkills
}
