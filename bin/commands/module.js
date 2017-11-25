
/**
 * 模块命令
 */

const moment = require('moment')
const fs = require('fs-extra')
const path = require('path')
const config = require('../config')
const { genFiles, Logger, confirm } = require('../tools')

exports.command = 'module [name]'
exports.aliases = 'm'
exports.describe = '创建一个模块'
exports.builder = (yargs) => {
  yargs.positional('name', {
    describe: '模块名称'
  }).option('remove', {
    describe: '删除路由'
  })
}
exports.handler = async function (argv) {
  const { remove } = argv
  if (remove) {
    await removeModule(argv)
  } else {
    await createModule(argv)
  }
}

// 计算目录相对路径，用于插入代码
const relativeFromModuleDir = path.relative(config.appDir, config.routeDir)


/**
 * 插入代码
 * 
 * @param {*} content 
 * @param {*} filename 
 */
function insertCode(content, filename) {
  const importCode = `\nimport ${filename} from '../modules/${filename}'`
  const exportCode = `${filename}`
  return content
    .replace(/(?=\s*export)/, importCode) // 添加import代码
    .replace(/(?=(\s)*\})/, `,\n  ${exportCode}`) // 添加export代码
}

/**
 * 从代码中移除路由相关code
 * 
 * @param {*} content 
 * @param {*} name 
 */
function removeCode(content, filename) {
  content = content
    .replace(new RegExp(`\\s*<Route((?!<Route)[\\s\\S])+component={${routeName}Route} />`, 'gi'), '')
    .replace(new RegExp(`\\s*const\\s*${routeName}Route\\s*=\\s*asyncComponent\\(\\(\\)\\s*=>\\s*import\\('.*/${filename}'\\)\\)`, 'gi'), '')
  return content
}

const MODULE_FILE_PATH = path.join(config.appDir, `reducers.js`)

/**
 * 创建模块
 * 
 * @param {*} argv 
 */
async function createModule(argv) {
  try {
    const { name } = argv
    const root = path.resolve(__dirname, '../../templates/module')
    const dist = path.join('.', config.moduleDir)
    if (fs.existsSync(path.join(dist, name + '.js'))) {
      if (!(await confirm(`模块 ${name} 已存在，是否替换？`))) {
        return
      }
      Logger.log('')
    }
    Logger.log(`---------- 创建模块 ${name} ---------`)
    await genFiles(root, dist, {
      name,
      author: config.author,
      date: moment().format('YYYY-MM-DD')
    }, false)
    let content = fs.readFileSync(MODULE_FILE_PATH).toString()
    content = insertCode(content, name)
    fs.writeFileSync(MODULE_FILE_PATH, content)
    Logger.log(`---------- 模块 ${name} 创建完成 ---------`)
  } catch (error) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}