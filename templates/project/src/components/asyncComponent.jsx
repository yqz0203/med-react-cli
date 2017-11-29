/**
 * 异步加载组件，用于codesplit
 */

import React, { Component } from 'react'

export default (loader) => {
  return class extends Component {
    mounted = true

    state = {
      Comp: null
    }

    componentDidMount() {
      loader().then(({ default: Comp }) => {
        if (!this.mounted) return
        this.setState({
          Comp
        })
      })
    }

    componentWillUnmount() {
      this.mounted = false
    }

    render() {
      const { Comp } = this.state
      return Comp ? <Comp {...this.props} /> : null
    }
  }
}