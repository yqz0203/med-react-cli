快速创建react+redux应用和常用文件，应用开发环境基于create-react-app.

## 用法

`npm install med-react-cli -g` or `yarn global add med-react-cli`

`medr --help`

`medr route --help`

>> 使用相关命令会自动插入相应代码，如创建route会在路由文件中自动插入引用代码，删除文件会在路由文件中删除引用代码。

### 创建一个引用

`medr init HelloApp`

### 创建一个路由

`medr route Home` or `medr r Home`

### 创建一个组件

`medr component Button` or `medr c Button`

### 创建一个模块

`medr module Login` or `medr m login`

### `--remove`

命令后面加上 `--remove` 或者 `-r`即为删除

>>更多用法请使用`--help`查看

## 为什么有这个东西

因为太懒了~🤣🤣🤣