

/**
 * 路由命令
 */

const fs = require('fs-extra')
const path = require('path')
const moment = require('moment')
const { genFiles, Logger, confirm } = require('../tools')
const config = require('../config')

const { handler: genModule } = require('./module')

exports.command = 'route <name> [options]'
exports.aliases = 'r'
exports.describe = '创建一个路由'
exports.builder = (yargs) => {
  yargs.positional('name', {
    describe: '路由名称'
  }).option('path', {
    alias: 'p',
    describe: '路径，默认为路由名称'
  }).option('redux', {
    alias: 'r',
    describe: '使用redux进行链接'
  }).option('exact', {
    alias: 'e',
    describe: '使用严格匹配模式'
  }).option('remove', {
    describe: '删除路由'
  })
}

exports.handler = async function (argv) {
  const { remove } = argv
  if (remove) {
    await removeRoute(argv)
  } else {
    await createRoute(argv)
  }
}

const ROUTE_FILE_PATH = path.join(config.appDir, `routes.js`)

// 计算目录相对路径，用于插入代码
const relativeFromRouteDir = path.relative(config.appDir, config.routeDir)

/**
 * 去掉路径中的连接字符
 * @param {*} name 
 */
function parseName(name) {
  // 去掉下划线，横线，点
  return name.replace(/\.|_|-/g, '')
}

/**
 * 插入代码
 * 
 * @param {*} content 
 * @param {*} filename 
 * @param {*} routeName 
 * @param {*} routePath 
 * @param {*} exact 
 */
function insertCode(content, filename, routeName, routePath, exact) {
  let importCode = `\nconst ${routeName}Route = asyncComponent(() => import('${relativeFromRouteDir}/${filename}'))`
  let routeCode = `<Route path='${routePath}'${exact?' exact':''} component={${routeName}Route} />`
  return content
    .replace(/(?=\s*class\s*Routes\s*extends)/, importCode) // 添加import代码
    .replace(/(?=\n*(\s*)<Route((?!<Route)[\s\S])+<\/Switch>)/, `\n$1${routeCode}`) // 添加route代码，考虑到可能有404，所以在最后一个route之上写    
}

/**
 * 从代码中移除路由相关code
 * 
 * @param {*} content 
 * @param {*} name 
 */
function removeCode(content, filename, routeName) {
  content = content
    .replace(new RegExp(`\\s*<Route((?!<Route)[\\s\\S])+component={${routeName}Route} />`, 'gi'), '')
    .replace(new RegExp(`\\s*const\\s*${routeName}Route\\s*=\\s*asyncComponent\\(\\(\\)\\s*=>\\s*import\\('.*/${filename}'\\)\\)`, 'gi'), '')
  return content
}

/**
 * 获取目标路径
 * 
 * @param {*} name 
 */
function getDistPath(name) {
  return path.join('.', config.routeDir, `${name}`)
}

/**
 * 创建路由
 * 
 * @param {*} argv 
 */
async function createRoute(argv) {
  try {
    const { name, redux, exact } = argv
    let routePath = argv.path
    if (!routePath) {
      routePath = `/${name.toLowerCase()}`
    }
    const root = path.resolve(__dirname, '../../templates/route')
    const dist = getDistPath(name)
    const _name = parseName(name)
    Logger.log(`---------- 创建路由 ${_name} ---------`)
    await genFiles(root, dist, {
      name: _name,
      author: config.author,
      date: moment().format('YYYY-MM-DD'),
      redux
    })
    let routeFilePath = ROUTE_FILE_PATH

    if (fs.existsSync(routeFilePath)) {
      Logger.log(`---------- 创建代码 ---------`)
      let content = fs.readFileSync(routeFilePath).toString()
      // 移除旧代码
      content = removeCode(content, name, _name)
      // 插入新代码
      content = insertCode(content, name, _name, routePath, exact)
      fs.writeFileSync(routeFilePath, content)
    }

    // 如果起用了redux 自动创建module
    if (redux) {
      Logger.log('')
      await genModule({ name: _name })
      Logger.log('')
    }
    Logger.log(`---------- 路由 ${_name} 创建完成 ---------`)
  } catch (error) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}

/**
 * 删除路由
 * 
 * @param {*} argv 
 */
async function removeRoute(argv) {
  try {
    const { name, redux } = argv
    const confirmed = await confirm(`确认删除路由 ${name} 吗？相关文件夹和引用都会被删除。`)
    if (!confirmed) {
      return
    }
    const _name = parseName(name)
    let routeFilePath = ROUTE_FILE_PATH
    const dist = path.join('.', config.routeDir, `${name}`)
    Logger.log(`\n---------- 删除文件夹 完成---------`)
    fs.removeSync(dist)
    if (fs.existsSync(routeFilePath)) {
      Logger.log(`---------- 删除代码引用 完成---------`)
      let content = fs.readFileSync(routeFilePath).toString()
      content = removeCode(content, name, _name)
      fs.writeFileSync(routeFilePath, content)
    }
    Logger.log(`---------- 成功删除路由 ${_name} ---------`)
  } catch (e) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}