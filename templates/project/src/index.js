/**
 * 初始化
 * @flow
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { Provider } from 'react-redux'
import AppContainer from './containers/AppContainer'
import createStore from './createStore'

// 全局样式
import './styles/main.css'

const root = document.querySelector('#root')
if (!root) {
  throw new Error('')
}

// 自定义history，这样可以使用react-router-redux
let history = createHashHistory()

ReactDOM.render(<Provider store={createStore({ history })}>
  <AppContainer history={history} />
</Provider>, root)