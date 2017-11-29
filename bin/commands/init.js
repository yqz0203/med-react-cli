
/**
 * 组件命令
 */

const path = require('path')
const { exec } = require('child_process')
const moment = require('moment')
const fs = require('fs-extra')
const { genFiles, Logger, confirm } = require('../tools')
const config = require('../config')

exports.command = 'init [name]'
exports.aliases = 'i'
exports.describe = '新建一个react应用'
exports.builder = (yargs) => {
  yargs.positional('name', {
    describe: 'app名称'
  })
}
exports.handler = async function (argv) {
  await createApp(argv)
}

/**
 * 创建组件
 * 
 * @param {*} argv 
 */
async function createApp(argv) {
  try {
    const { name } = argv
    const root = path.resolve(__dirname, '../../templates/project')
    const dist = path.join('.', `${name}`)
    if (fs.existsSync(dist)) {
      Logger.error(`文件夹${name}已存在，请清理后尝试`)
      process.exit(1)
    }
    Logger.log(`---------- 创建app ${name} ---------`)
    await genFiles(root, dist, {
      name,
      author: config.author,
      date: moment().format('YYYY-MM-DD')
    })
    Logger.log(`\n---------- 安装依赖 ---------\n`)
    await installPackage(name)
    // 安装npm
    Logger.log(`---------- app ${name} 创建完成 ---------\n`)
    Logger.warn(`使用 cd ${name} && yarn start 启动`)
  } catch (error) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}

function installPackage(name) {
  return new Promise((resolve, reject) => {
    const child = exec(`cd ${name} && yarn`, (error) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve()
      }
    })
    child.stdout.on('data', function (data) {
      Logger.log(data)
    })
  })
}