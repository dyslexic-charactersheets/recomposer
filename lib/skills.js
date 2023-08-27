// const { StandardFonts, rgb } = require('pdf-lib');

const { inferSkills, getGameData } = require('./GameData.js');
const { log, warn, error } = require('./log.js');
const { t } = require('./i18n.js');
const { getSkillsProfile } = require('./cls/SkillsProfile.js');


const skillFontSize = 8;
const attrFontSize = 10.4;

async function writeSkills(doc, pageInfo) {
  let skills = doc.gameData.getSkills(pageInfo, doc.settings);
  if (skills.length == 0) {
    return;
  }

  let profile = getSkillsProfile(pageInfo, doc.settings);
  if (profile == null) {
    error("skills", "No skill profile for page:", pageInfo);
    return;
  }

  // log("skills", "Writing skills", skills, profile);

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

  // sort with translation and fold
  function sortSkills(skills) {
    let above = [], below = [];
    for (let skill of skills) {
      skill.translation = t(skill.name, doc.settings.language);
      if (skill.afterFold) {
        below.push(skill);
      } else {
        above.push(skill);
      }
    }

    above.sort((a, b) => (a.translation > b.translation) ? 1 : -1 );
    below.sort((a, b) => (a.translation > b.translation) ? 1 : -1);
    return [...above, ...below];
  }

  topSkills = sortSkills(topSkills);
  
  // write a skill line
  async function drawCheckbox(pos, left, checked) {
    let baseline = profile.firstLine + pos * profile.lineIncrement;
    await doc.canvas.drawRectangle({
      x: left,
      y: baseline,
      width: 4.8,
      height: 4.8,
      borderWidth: 0.5,
      borderColor: doc.textColour,
      color: checked ? doc.textColour : doc.white,
      // opacity: 0.5,
      // borderOpacity: 0.75,
      opacity: 1,
      borderOpacity: 1,
    });
  }

  async function drawSubskillCurve(pos) {
    let base = profile.firstLine + pos * profile.lineIncrement + 2;
    let left = profile.skillsAreaLeft + 5;

    let curvelen = 3.5;
    let outerlen = 6.7;
    let linelen = outerlen - curvelen;

    let svgPath = `M 0,0 l 0,${linelen} a ${curvelen},${curvelen} 0 0,0 ${curvelen},${curvelen} l ${linelen},${0}`;
    doc.canvas.drawSvgPath(svgPath, {
      x: left,
      y: base + outerlen,
      borderWidth: 0.6,
      borderColor: doc.textColour,
    });
  }

  async function writeSkillLine(pos, skill, isSubskill) {
    if (skill === null) {
      error("skills", "No skill");
    }
    if (!skill.hasOwnProperty("name") || skill.name === undefined || skill.name === null || skill.name == "") {
      error("skills", "Skill with no name:", pos, skill);
    }

    let baseline = profile.firstLine + pos * profile.lineIncrement;
    let left = isSubskill ? profile.skillNameLeft + 12 : profile.skillNameLeft;

    if (isSubskill) {
      drawSubskillCurve(pos);
    }

    // name
    let name = t(skill.name, doc.settings.language);
    await doc.canvas.drawText(name, {
      x: left,
      y: baseline,
      font: doc.textFont,
      size: skillFontSize,
      color: doc.textColour,
    });
    
    let isCorePage = pageInfo.slot == "core" || pageInfo.slot == "eidolon" || pageInfo.slot == "spiritualist-phantom" || pageInfo.slot == "drone"
    if (isCorePage) {
      // use untrained
      if (skill.useUntrained) {
        drawCheckbox(pos, profile.useUntrainedMiddle, true);
      }

      // ability
      let ability = t(skill.ability, doc.settings.language);
      if (ability !== undefined && ability !== null && ability != "") {
        let abilityWidth = doc.altFont.widthOfTextAtSize(ability, 10.4);
        doc.canvas.drawText(ability, {
          x: profile.abilityMiddle - abilityWidth / 2,
          y: baseline,
          font: doc.altFont,
          size: attrFontSize,
          opacity: 0.2,
        });
      }

      // box ranks
      if (skill.boxRanks) {
        doc.canvas.drawRectangle({
          x: profile.ranksMiddle - profile.acpWidth,
          y: baseline + profile.lineBottomOffset,
          width: profile.acpWidth,
          height: -profile.lineIncrement,
          borderWidth: 0.5,
          borderColor: doc.textColour,
        });
      }

      // class skill checkbox
      if (!isSubskill && !skill.noRanks) {
        if (doc.settings.isPathfinder || doc.settings.isStarfinder) {
          // log("skills", `Class skill checkbox at ${profile.classSkillMiddle}, line ${pos}`);
          drawCheckbox(pos, profile.classSkillMiddle, skill.isClassSkill);
        } else if (doc.settings.isDnD35) {
          let n = (pageInfo.variant == "more") ? 7 : 5;
          for (let i = 0; i < n; i++) {
            drawCheckbox(pos, profile.classSkillMiddle + i * profile.classSkillIncrement, false);
          }

          // for (let i = )
        }
      }
     
      // Level bonuses
      // ...
      
      // Armour Check Penalty
      if (profile.isCorePage && skill.acp) {
        let acpLeft = profile.skillsAreaRight - profile.acpWidth;
        doc.canvas.drawText("-", {
          x: profile.skillsAreaRight - profile.acpWidth + 3,
          y: baseline - 1,
          font: doc.textFont,
          size: attrFontSize,
          color: doc.textColour,
        });

        // if (doc.settings.isDnD35) log("skills", "Is skill double?", skill);
        let isAcpDouble = doc.settings.isDnD35 && skill.name == "Swim";

        doc.canvas.drawRectangle({
          x: acpLeft,
          y: baseline + profile.lineBottomOffset,
          width: profile.acpWidth,
          height: profile.lineBoxHeight,
          borderWidth: isAcpDouble ? 1 : 0.5,
          borderColor: doc.textColour,
          borderDashArray: [2, 2],
          borderDashPhase: 0,
        });

        if (isAcpDouble) {
          doc.canvas.drawText("×2", {
            x: profile.skillsAreaRight - 10,
            y: baseline - 1,
            font: doc.textFont,
            size: skillFontSize,
            color: doc.textColour,
          });
        }
      }

    }
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
      subSkills = sortSkills(subskillsBySkill[skill.name]);
      for (let subSkill of subSkills) {
        writeSkillLine(pos, subSkill, true);
        pos++;
      }
    }
  }

  // fill in the blanks
  while (pos < profile.numSlots) {
    drawCheckbox(pos, profile.useUntrainedMiddle, false);
    drawCheckbox(pos, profile.classSkillMiddle, false);
    pos++;
  }
}

module.exports = {
  writeSkills
}
