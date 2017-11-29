#!/usr/bin/env node

/**
 * index.js
 */

const yargs = require('yargs')
const moment = require('moment')
const template = require('art-template')

// 不转义编码
template.defaults.escape = false

require('moment/locale/zh-cn')

yargs
  .usage('用法: $0 <type> <options> [name]')
  .command(require('./commands/init'))
  .command(require('./commands/route'))
  .command(require('./commands/component'))
  .command(require('./commands/module'))
  .example('$0 init hello-react', '创建一个名为hello-react的应用')
  .example('')
  .example('$0 route Home', '创建一个名为Home的路由')
  .example('$0 route --name=Home', '同上')
  .example('$0 r Home --path /home', '创建一个名为Home的路由，并设置路径为/home')
  .example('$0 r Home --redux', '创建一个Home的路由，并使用redux进行连接，并创建一个模块')
  .example('$0 r Home --exact', '创建一个Home的路由，使用严格路径匹配')
  .example('')
  .example('$0 component Button', '创建一个Button组件')
  .example('$0 c Button --pure', '创建一个Button组件，并使用PureComponent')
  .example('')
  .example('$0 module Login', '创建一个登录模块')
  .example('$0 m Login', '同上')
  .help()
  .argv