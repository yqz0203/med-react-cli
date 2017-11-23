/**
 * module <%= name %>.js
 * 
 * @author <%= author %>
 * @date <%= date %>
 * @modify <%= date %>
 */


import { call, put, takeLatest, fork, all } from 'redux-saga/effects'

import http from '../../utils/http'
import createReducer from '../createReducer'

const namespace = '<%=name%>'
const LOAD = `${namespace}/LOAD`
const LOAD_ING = `${namespace}/LOAD_ING`
const LOAD_DONE = `${namespace}/LOAD_DONE`

/**
 * action handlers
 */
const ACTION_HANDLERS = {
  [LOAD_ING]: (state, action) => {
    return {
      loading: true,
      error: null
    }
  },
  [LOAD_DONE]: (state, action) => {
    const { payload, error } = action
    if (error) {
      return {
        loading: false,
        error
      }
    }
    return {
      loading: false,
      data: payload,
      error: null
    }
  }
}

/**
 * initial state
 */
const INITIAL_STATE = {
  data: null,
  loading: false,
  error: null
}

export const selector = (state) => get(state, namespace)

export default createReducer(INITIAL_STATE, ACTION_HANDLERS)

/**
 * actions
 */
export const actions = {
  /**
   * load
   */
  load: (params) => ({
    type: LOAD,
    params
  })
}

/**
 * effects
 */
export const effects = {
  /**
   * load
   */
  *load(){
    try {
      yield put({
        type: LOAD_ING
      })
      const response = yield call(http.get, {
        url: '/common/hospital/get'
      })
      yield put({
        type: LOAD_DONE,
        payload: response
      })
    } catch (error) {
      yield put({
        type: LOAD_DONE,
        error
      })
    }
  },

  /**
   * watch load action
   */
  *watchLoad(){
    yield takeLatest(LOAD, function* ({ params }) {
      yield effects.load(params)
    })
  }
}

/**
 * saga
 */
export const saga = function* (){
  yield all([
    fork(effects.watchLoad)
  ])
}