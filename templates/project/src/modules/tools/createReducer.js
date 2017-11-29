export default (initialState, handlers) => (state = initialState, action) => {
    if (action.type === 'RESET_ALL_STATE') {
        return {
            ...initialState
        }
    }

    let handler = handlers[action.type]
    if (!handler) {
        return { ...state }
    }
    let nextState = handler(state, action)
    return {
        ...state,
        ...nextState
    }
}