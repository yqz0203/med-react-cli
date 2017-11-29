/**
 * 存储模块
 */

import _isString from 'lodash/isString'

let defaultAgent = (() => {
  let storage = {}
  return {
    getItem(key) {
      return storage[key] || null
    },
    setItem(key, value) {
      storage[key] = value
    },
    removeItem(key) {
      delete storage[key]
    }
  }
})()

if ('localStorage' in window) {
  try {
    let randomKey = Math.random() * 1000000
    window.localStorage.setItem(randomKey, randomKey)
    window.localStorage.removeItem(randomKey)
    defaultAgent = window.localStorage
  } catch (e) {
  }
}


const defaultConfig = {
  agent: defaultAgent,
  maxAge: 3600 * 1000 * 24 * 30, // 30天
  splitter: '_'
}

const stringify = JSON.stringify
const parse = JSON.parse

class Store {
  constructor(userConfig) {
    if (!_isString(userConfig.namespace)) {
      throw new Error('必须指定一个命名空间')
    }
    const config = {
      ...defaultConfig,
      ...userConfig
    }
    this._config = config
    this._init()
  }

  /**
   * 初始化
   */
  _init() {
    const { namespace, agent } = this._config
    let store = agent.getItem(namespace)
    if (store) {
      try {
        store = parse(store)
      } catch (e) {
        store = {}
      }
    } else {
      store = {}
    }
    this.store = store
  }

  /**
   * 同步store信息
   */
  _syncStore() {
    const { namespace, agent } = this._config
    agent.setItem(namespace, stringify(this.store))
  }

  /**
   * 存储描述信息
   */
  _saveDesc(key, value, maxAge) {
    const { agent } = this._config
    const valueKey = this._generateSaveKey(key)
    let desc = {
      key: valueKey,
      maxAge,
      updateTime: Date.now()
    }
    if (this.store[key]) {
      desc = {
        ...this.store[key],
        ...desc,
      }
    } else {
      desc.insertTime = Date.now()
    }
    this.store[key] = desc
    agent.setItem(valueKey, value)
    this._syncStore()
  }

  /**
   * 获取描述信息
   * 
   * @param {*} key 
   */
  _getDesc(key) {
    return this.store[key] || null
  }

  /**
   * 移除某个描述信息
   */
  _removeDesc(key) {
    delete this.store[key]
    this._syncStore()
  }

  /**
   * 转变存储值
   * @param {*} value 
   */
  _convertSaveValue(value) {
    if (typeof value === 'string') {
      return value
    }

    if (typeof value === 'object') {
      value = stringify(value)
    }

    return value + ''
  }

  /**
   * 转变读取的值
   * @param {*} value 
   */
  _convertLoadValue(value) {
    if (value === null || value === undefined) return null
    if (value === 'false') return false
    if (value === 'true') return true
    if (value === 'undefined') return undefined
    if (value === 'null') return null
    try {
      value = parse(value)
    } catch (e) {
      return value
    }
    return value
  }

  /**
   * 生成存储的key值
   * @param {*} key 
   */
  _generateSaveKey(key) {
    return `${this._config.namespace}${this._config.splitter}${key}`
  }

  /**
   * 保存键值
   * 
   * @param {object} config 
   * - key {string} 存储键
   * - value {any} 存储值
   * - maxAge {number} 过期 时间（毫秒），传0则永不过期 
   */
  save(config) {
    const { key, maxAge = this._config.maxAage } = config
    const value = this._convertSaveValue(config.value)
    this._saveDesc(key, value, maxAge)
  }

  /**
   * 保存键值
   * 
   * @param {object} config 
   * - key {string} 存储键
   */
  load(config) {
    const { key } = config
    const desc = this._getDesc(key)
    if (!desc) {
      return null
    }
    const { key: valueKey, maxAge, updateTime } = desc
    // 过期了
    if (maxAge !== 0 && Date.now() - updateTime > maxAge) {
      this.remove({ key })
      return null
    }
    const value = this._convertLoadValue(this._config.agent.getItem(valueKey))
    return value
  }

  /**
   * 移除某个值
   * 
   * @param {*} config 
   */
  remove(config) {
    const { key } = config
    this._removeDesc(key)
    this._config.agent.removeItem(key)
    return null
  }

  /**
   * 移除所有值
   */
  removeAll() {
    for (let key in this.store) {
      const valuekey = this.store[key].key
      this._config.agent.removeItem(valuekey)
    }
  }
}

export default {
  /**
   * 创建一个store，如果该命名空间下已经存在，则读取。
   * 
   * @param {*} config 
   * - namespace {string} 命名空间
   * - agent {object} 代理，默认localstorage
   * - maxAge {number} 有效时间
   * - splitter {string} 分隔符 默认为'_'
   */
  create(config) {
    return new Store(config)
  }
}