/**
 * 配置
 */

const fs = require('fs-extra')
const path = require('path')

/**
 * 默认配置
 */
const config = {
  appDir: 'src/app',
  componentDir: 'src/components',
  containerDir: 'src/containers',
  moduleDir: 'src/modules',
  routeDir: 'src/routes',
}

if (fs.existsSync('medr.json')) {
  Object.assign(config, require(path.resolve(`medr.json`)))
}

module.exports = config