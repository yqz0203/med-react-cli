
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
    describe: '删除模块'
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
const relativeFromModuleDir = path.relative(config.appDir, config.moduleDir)


/**
 * 插入reducer代码
 * 
 * @param {*} content 
 * @param {*} filename 
 */
function insertReducerCode(content, filename) {
  const exportCode = `${filename}: require('../modules/${filename}').default`
  const empty = /export\s+default\s+\{\s*\}/.test(content)
  return content.replace(/(?=(\s)*\})/, `${empty ? '' : ','}\n  ${exportCode}`) // 添加export代码
}

/**
 * 插入saga代码
 * 
 * @param {*} content 
 * @param {*} filename 
 */
function insertSagaCode(content, filename) {
  const exportCode = `fork(require('../modules/${filename}').saga)`
  const empty = /yield\s+all\(\s*\[\s*\]\s*\)/.test(content)
  return content.replace(/(?=(\s)*\])/, `${empty ? '' : ','}\n    ${exportCode}`) // 添加export代码
}

/**
 * 从代码中移除路由相关code
 * 
 * @param {*} content 
 * @param {*} name 
 */
function removeReducerCode(content, filename) {
  content = content
    .replace(new RegExp(`,?\\s*.*${filename}'\\).default`, 'gi'), '')
  return content
}

/**
 * 从代码中移除路由相关saga code
 * 
 * @param {*} content 
 * @param {*} name 
 */
function removeSagaCode(content, filename) {
  content = content
    .replace(new RegExp(`,?\\s*.*${filename}'\\).saga\\)`, 'gi'), '')
  return content
}

const REDUCER_FILE_PATH = path.join(config.appDir, `reducers.js`)
const SAGA_FILE_PATH = path.join(config.appDir, `sagas.js`)

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
    let content = fs.readFileSync(REDUCER_FILE_PATH).toString()
    let sagaContent = fs.readFileSync(SAGA_FILE_PATH).toString()
    content = removeReducerCode(content, name)
    sagaContent = removeSagaCode(sagaContent, name)
    content = insertReducerCode(content, name)
    sagaContent = insertSagaCode(sagaContent, name)
    fs.writeFileSync(REDUCER_FILE_PATH, content)
    fs.writeFileSync(SAGA_FILE_PATH, sagaContent)
    Logger.log(`---------- 模块 ${name} 创建完成 ---------`)
  } catch (error) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}

/**
 * 移除模块
 * 
 * @param {*} argv 
 */
async function removeModule(argv) {
  try {
    const { name } = argv
    const confirmed = await confirm(`确认删除模块 ${name} 吗？相关引用可能需要手动删除。`)
    if (!confirmed) {
      return
    }
    const dist = path.join('.', config.moduleDir, name + '.js')
    let content = fs.readFileSync(REDUCER_FILE_PATH).toString()
    let sagaContent = fs.readFileSync(SAGA_FILE_PATH).toString()
    // 删除代码
    content = removeReducerCode(content, name)
    sagaContent = removeSagaCode(sagaContent, name)
    Logger.log(`---------- 删除文件 ${dist} ---------`)
    fs.removeSync(dist)
    Logger.log(`---------- 删除代码引用 ---------`)
    fs.writeFileSync(REDUCER_FILE_PATH, content)
    fs.writeFileSync(SAGA_FILE_PATH, sagaContent)
    Logger.log(`---------- 成功删除模块 ${name} ---------`)
  } catch (error) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}