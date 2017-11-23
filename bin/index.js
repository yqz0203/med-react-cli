#!/usr/bin/env node

/**
 * index.js
 */

const readline = require('readline')
const moment = require('moment')
const fs = require('fs-extra')
const path = require('path')
const yargs = require('yargs')
const chalk = require('chalk').default
const template = require('art-template')

// 不转义编码
template.defaults.escape = false

require('moment/locale/zh-cn')

/**
 * 默认配置
 */
const config = {
  componentDir: 'dist/components',
  containerDir: 'dist/containers',
  moduleDir: 'dist/modules',
  routeDir: 'dist/routes',
}

if (fs.existsSync('medr.json')) {
  Object.assign(config, require(path.resolve(`medr.json`)))
}

const Logger = {
  log() {
    return console.log(chalk.greenBright(...arguments))
  },
  warn() {
    return console.log(chalk.yellowBright(...arguments))
  },
  error() {
    return console.log(chalk.redBright(...arguments))
  }
}

function question(msg) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(chalk.greenBright(msg), (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}

async function confirm(msg) {
  const answer = await question(msg)
  if (answer === 'no') {
    return false
  } else if (answer === 'yes') {
    return true
  } else {
    return await confirm('输入不正确，请重新输入 yes | no：')
  }
}

function exit() {
  process.exit(1)
}

yargs
  .usage('用法: $0 <type> [name] [options]')
  .command(['route [name]', 'r'], '创建路由', {
    name: {
      alias: 'n',
      describe: '路由名称'
    },
    path: {
      alias: 'p',
      describe: '路径，默认为路由名称'
    },
    redux: {
      alias: 'r',
      describe: '使用redux进行链接'
    }
  }, genRoute)
  .command(['component [name]', 'c'], '创建一个组件', {
    name: {
      alias: 'n',
      describe: '组件名称'
    },
    pure: {
      alias: 'p',
      describe: '是否使用PureComponent, 默认为否'
    }
  }, genComponent)
  .command(['module [name]', 'm'], '创建一个模块', {
  }, genModule)
  .demandOption('name')
  .example('$0 route Home', '创建一个名为Home的路由')
  .example('$0 route --name=Home', '同上')
  .example('$0 r Home --path /home', '创建一个名为Home的路由，并置顶路径为/home')
  .example('$0 r Home --redux', '创建一个Home的路由，并使用redux进行连接，并创建一个模块')
  .example('$0 component Button', '创建一个Button组件')
  .example('$0 c Button --pure', '创建一个Button组件，并使用PureComponent')
  .example('$0 module Login', '创建一个登录模块')
  .example('$0 m Login', '同上')
  .demandCommand()
  .help()
  .argv

/**
 * 创建文件
 * @param {*} root 
 * @param {*} dist 
 * @param {*} data 
 * @param {*} checkRepeat 
 */
async function _genFiles(root, dist, data, checkRepeat = true) {
  if (fs.existsSync(dist) && checkRepeat) {
    let res = await confirm(`警告：\n  目标路径：${path.resolve(dist)} 已经存在，\n  继续将覆盖原内容，是否继续？yes | no `)
    if (res) {
      _start()
    } else {
      exit()
    }
  } else {
    _start()
  }

  function _start() {
    Logger.log('---------- 分析文件 -----------')
    const results = _genTemplate(root, data)
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

/**
 * 生成模板
 * @param {*} dir 
 * @param {*} data 
 */
function _genTemplate(dir, data) {
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
      }, _genTemplate(filePath, data))
    }
    return pre
  }, [])
}

/**
 * 创建路由
 */
async function genRoute(argv) {
  try {
    const { name, redux } = argv
    let routePath = argv.path
    if (!routePath) {
      routePath = `/${name.toLowerCase()}`
    }
    const root = path.resolve(__dirname, '../templates/route')
    const dist = path.join('.', config.routeDir, `${name}`)
    // 去掉下划线，横线，点
    const _name = name.replace(/\.|_|-/g, '')
    Logger.log(`---------- 创建路由 ${_name} ---------`)
    await _genFiles(root, dist, {
      name: _name,
      author: config.author,
      date: moment().format('YYYY-MM-DD'),
      redux
    })
    let routeFilePath = path.join(config.routeDir, `index.js`)

    if (fs.existsSync(routeFilePath)) {
      Logger.log(`---------- 创建代码 ---------`)
      let content = fs.readFileSync(routeFilePath).toString()
      let importCode = `\nconst ${_name}Route = asyncComponent(() => import('./${name}'))`
      let routeCode = `<Route path='${routePath}' component={${_name}Route} />`
      // 添加import代码
      content = content.replace(/(?=(\n|\r\n)+\s*class\s*Routes\s*extends)/, importCode)
      // 添加route代码，考虑到可能有404，所以在最后一个route之上写
      content = content.replace(/(?=(\n|\r\n)+(\s*)<Route((?!<Route)[\s\S])+<\/Switch>)/, `\n$2${routeCode}`)
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
 * 创建组件
 * 
 * @param {*} argv 
 */
async function genComponent(argv) {
  try {
    const { name, pure } = argv
    Logger.log(`---------- 创建组件 ${name} ---------`)
    const root = path.resolve(__dirname, '../templates/component')
    const dist = path.join('.', config.componentDir, `${name}`)
    await _genFiles(root, dist, {
      name,
      pure: pure !== undefined,
      author: config.author,
      date: moment().format('YYYY-MM-DD')
    })
    Logger.log(`---------- 组件 ${name} 创建完成 ---------`)
  } catch (error) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}

/**
 * 创建一个模块
 * 
 * @param {*} argv 
 */
async function genModule(argv) {
  try {
    const { name } = argv
    const root = path.resolve(__dirname, '../templates/module')
    const dist = path.join('.', config.moduleDir)
    if (fs.existsSync(path.join(dist, name + '.js'))) {
      if (!(await confirm(`模块 ${name} 已存在，是否替换？yes | no  `))) {
        return
      }
      Logger.log('')
    }
    Logger.log(`---------- 创建模块 ${name} ---------`)
    await _genFiles(root, dist, {
      name,
      author: config.author,
      date: moment().format('YYYY-MM-DD')
    }, false)
    Logger.log(`---------- 模块 ${name} 创建完成 ---------`)
  } catch (error) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}



