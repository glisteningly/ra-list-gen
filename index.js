const GEN_THUMB = true

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const SYSTEM_MAP = {
  CPS1: 'Capcom - CP System I',
  CPS2: 'Capcom - CP System II',
  CPS3: 'Capcom - CP System III',
  NEOGEO: 'SNK - Neo Geo',
  PGM: 'IGS - Poly Game Master'
}

// 最终输出的ROM路径
// const DEST_ROM_PATH = 'D:/Game/Emu/PegasusRoms'
const DEST_ROM_PATH = '/storage/emulated/0/Roms'

const SRC_PATH = 'D:/Game/Emu/PegasusRoms'

// const PLAYLIST_PATH = 'D:/Game/Emu/PegasusRoms/_RetroArch/playlists'
const PLAYLIST_PATH = 'D:/Game/Emu/_RetroArch/playlists'
// const THUMB_PATH = 'D:/Game/Emu/RetroArch/thumbnails'
const THUMB_PATH = 'D:/Game/Emu/_RetroArch/thumbnails'

const systemGen = (systemDir) => {

  const CUR_SYSTEM_DIR = systemDir
  const CUR_SYSTEM_NAME = SYSTEM_MAP[CUR_SYSTEM_DIR] ? SYSTEM_MAP[CUR_SYSTEM_DIR] : CUR_SYSTEM_DIR
  const ROM_PATH = `${SRC_PATH}/${systemDir}`


  const xmlPath = path.join(`${SRC_PATH}/${CUR_SYSTEM_DIR}`, 'gamelist.xml');
  const xmlString = fs.readFileSync(xmlPath, 'utf8');

  const convert = require('xml-js');

  const result1 = convert.xml2js(xmlString, { compact: true, spaces: 4 });

  const getFileName = (filePath) => {
    const filename = path.basename(filePath)
    const extname = path.extname(filePath)
    return (filename.replace(extname, ''))
  }

  let gameCount = 0

  const jsonToRaList = (list) => {
    gameCount = 0
    return list.map(game => {
      const file = game.path._text.replace('./', '')
      const gameFileName = getFileName(game.path._text)
      const destDir = `${THUMB_PATH}/${CUR_SYSTEM_NAME}`
      const path = `${DEST_ROM_PATH}/${file}`
      const label = game.name._text

      if (GEN_THUMB) {
        // copy thumnails
        tryCreateDir(destDir)
        const REG = /:|&|<|>|\*|\?|\\|\||\//g

        // title image
        const _imgTitlePath = `${ROM_PATH}/media/${gameFileName}/logo.png`
        if (fs.existsSync(_imgTitlePath)) {
          const thumbDir = `${destDir}/Named_Titles`
          const _label = label.replace(REG, '_')
          const thumbFile = `${destDir}/Named_Titles/${_label}.png`
          tryCreateDir(thumbDir)
          fs.writeFileSync(thumbFile, fs.readFileSync(_imgTitlePath));
        }

        // title boxFront
        const _imgBoxFrontPath = `${ROM_PATH}/media/${gameFileName}/boxFront.jpg`
        if (fs.existsSync(_imgTitlePath)) {
          const thumbDir = `${destDir}/Named_Boxarts`
          const _label = label.replace(REG, '_')
          const thumbFile = `${destDir}/Named_Boxarts/${_label}.png`
          tryCreateDir(thumbDir)
          fs.writeFileSync(thumbFile, fs.readFileSync(_imgBoxFrontPath));
          Jimp.read(_imgBoxFrontPath, (err, lenna) => {
            if (err) throw err;
            lenna.write(thumbFile);
          });
        }
      }

      console.log(`${gameFileName} converted!`)

      gameCount++

      return {
        path,
        label
      }
    })
  }

  const tryCreateDir = (path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
  }

  const outGameList = jsonToRaList(result1.gameList.game)
  const outLPL = {
    "version": "1.0",
    "items": outGameList
  }

  try {
    fs.writeFileSync(`${PLAYLIST_PATH}/${CUR_SYSTEM_NAME}.lpl`, JSON.stringify(outLPL, null, 2))
    console.log('文件写入成功')
  } catch (err) {
    console.error(err)
  }

  console.log('\n\r\n\r')
  console.log(`Finfshed, ${gameCount} games converted!`)
}

const readDir = fs.readdirSync(SRC_PATH);

readDir.forEach((dir) => {
  systemGen(dir)
})