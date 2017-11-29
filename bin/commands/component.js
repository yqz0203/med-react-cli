
const moment = require('moment')

/**
 * 组件命令
 */

const path = require('path')
const fs = require('fs-extra')
const { genFiles, Logger, confirm } = require('../tools')
const config = require('../config')

exports.command = 'component [name]'
exports.aliases = 'c'
exports.describe = '创建一个组件'
exports.builder = (yargs) => {
  yargs.positional('name', {
    describe: '组件名称'
  }).option('pure', {
    alias: 'p',
    describe: '是否使用PureComponent, 默认为否'
  }).option('remove', {
    alias: 'r',
    describe: '删除组件'
  })
}
exports.handler = async function (argv) {
  const { remove } = argv
  if (remove) {
    await removeComponent(argv)
  } else {
    await createComponent(argv)
  }
}

/**
 * 创建组件
 * 
 * @param {*} argv 
 */
async function createComponent(argv) {
  try {
    const { name, pure } = argv
    Logger.log(`---------- 创建组件 ${name} ---------`)
    const root = path.resolve(__dirname, '../../templates/component')
    const dist = path.join('.', config.componentDir, `${name}`)
    await genFiles(root, dist, {
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
 * 创建组件
 * 
 * @param {*} argv 
 */
async function removeComponent(argv) {
  try {
    const { name } = argv
    const confirmed = await confirm(`确认删除组件 ${name} 吗？相关引用可能需要手动删除。`)
    if (!confirmed) {
      return
    }
    Logger.log(`\n---------- 删除组件 ${name} 完成---------`)
    const root = path.resolve(__dirname, '../../templates/component')
    const dist = path.join('.', config.componentDir, `${name}`)
    fs.removeSync(dist)
    Logger.log(`---------- 成功删除组件 ${name} ---------`)
  } catch (error) {
    Logger.error(error.stack)
    Logger.error(`---------- 发生错误，退出 ---------`)
  }
}