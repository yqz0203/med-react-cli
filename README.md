快速创建react+redux应用和常用文件，应用开发环境基于create-react-app.

# 用法

`npm install med-react-cli -g` 或 `yarn global add med-react-cli`

`medr --help`

`medr route --help`

>> 使用相关命令会自动插入相应代码，如创建route会在路由文件中自动插入引用代码，删除文件会在路由文件中删除引用代码。

## 创建应用

`medr init HelloApp`

或

`medr i HelloApp`

## 创建路由

`medr route Home`

或

 `medr r Home`

## 创建组件

`medr component Button`

或

`medr c Button`

## 创建模块

`medr module Login`

或

`medr m login`

## `--remove`

命令后面加上 `--remove` 或 `-r`即为删除

例如`med route Home --remove`

>>更多用法请使用`--help`查看

# 为什么有这个东西

因为太懒了~🤣🤣🤣