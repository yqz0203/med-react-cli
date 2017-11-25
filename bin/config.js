/**
 * 配置
 */

const fs = require('fs-extra')
const path = require('path')

/**
 * 默认配置
 */
const config = {
  app: 'dist/app',
  componentDir: 'dist/components',
  containerDir: 'dist/containers',
  moduleDir: 'dist/modules',
  routeDir: 'dist/routes',
}

if (fs.existsSync('medr.json')) {
  Object.assign(config, require(path.resolve(`medr.json`)))
}

module.exports = config