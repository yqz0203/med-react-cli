/**
 * redux store
 */

import reduxLogger from 'redux-logger'
import reduxThunk from 'redux-thunk'
import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import { routerMiddleware, routerReducer, syncHistoryWithStore } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'

import sagas from './app/sagas'
import reducers from './app/reducers'

export default ({ history }) => {
    let sagaMiddleware = createSagaMiddleware()
        // 把redux中间件放这里
    let middlewares = [reduxThunk, routerMiddleware(history), sagaMiddleware]
        // 有开发工具了就不用自己写的logger
    if (!window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ && process.env.NODE_ENV === 'development') {
        middlewares.unshift(reduxLogger)
    }
    // 让reduxdevtool能感知状态
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
    let store = createStore(combineReducers({
        ...reducers,
        routing: routerReducer
    }), composeEnhancers(applyMiddleware(...middlewares)))
    syncHistoryWithStore(history, store)

    sagaMiddleware.run(sagas)

    return store
}