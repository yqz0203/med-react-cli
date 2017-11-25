

const readline = require('readline')
const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk').default
const template = require('art-template')

const Logger = {
  log() {
    return console.log(chalk.greenBright(...arguments))
  },
  logMessage(){
    return chalk.greenBright(...arguments)
  },
  warn() {
    return console.log(chalk.yellowBright(...arguments))
  },
  warnMessage(){
    return chalk.yellowBright(...arguments)
  },
  error() {
    return console.log(chalk.redBright(...arguments))
  },
  errorMessage(){
    return chalk.redBright(...arguments)
  },
}
exports.Logger = Logger

function question(msg) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(chalk.yellowBright(msg), (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}
exports.question = question

async function confirm(msg) {
  const answer = await question(msg + ' \nyes | no  ')
  if (answer === 'no') {
    return false
  } else if (answer === 'yes') {
    return true
  } else {
    return await confirm('输入不正确，请重新输入')
  }
}
exports.confirm = confirm

function exit() {
  process.exit(1)
}
exports.exit = exit

/**
 * 创建文件
 * @param {*} root 
 * @param {*} dist 
 * @param {*} data 
 * @param {*} checkRepeat 
 */
async function genFiles(root, dist, data, checkRepeat = true) {
  if (fs.existsSync(dist) && checkRepeat) {
    let res = await confirm(`警告：\n  目标路径：${path.resolve(dist)} 已经存在，\n  继续将覆盖原内容，是否继续？yes | no `)
    if (res) {
      start()
    } else {
      exit()
    }
  } else {
    start()
  }

  function start() {
    Logger.log('---------- 分析文件 -----------')
    const results = genTemplate(root, data)
    Logger.log('---------- 分析完成，开始创建文件 ---------')
    Logger.log('')
    results.forEach((one) => {
      const { type, content, fullPath } = one
      const relativePath = path.relative(root, fullPath)
      const distFullPath = path.resolve(dist, relativePath)
      if (type === 'file') {
        Logger.log(`复制文件：${distFullPath}`)
        fs.ensureFileSync(distFullPath)
        fs.writeFileSync(distFullPath, content)
      } else {
        Logger.log(`复制文件夹：${distFullPath}`)
        fs.ensureDirSync(distFullPath)
      }
    })
    Logger.log('')
    Logger.log(`---------- 创建文件完成 ---------`)
  }
}
exports.genFiles = genFiles

/**
 * 生成模板
 * @param {*} dir 
 * @param {*} data 
 */
function genTemplate(dir, data) {
  const files = fs.readdirSync(dir)
  if (files.length === 0) return []
  return files.reduce((pre, file) => {
    let filePath = path.resolve(dir, file)
    let stat = fs.statSync(filePath)
    if (stat.isFile() && file[0] !== '.') {
      const fileContent = template(filePath, data)
      const fullPath = template.render(filePath, data)
      return pre.concat([{
        type: 'file',
        fullPath: fullPath,
        content: fileContent
      }])
    }
    if (stat.isDirectory()) {
      return pre.concat({
        type: 'dic',
        fullPath: filePath
      }, genTemplate(filePath, data))
    }
    return pre
  }, [])
}

exports.genTemplate = genTemplate


