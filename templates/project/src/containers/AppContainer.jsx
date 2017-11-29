/**
 * app container
 */

import React, { PureComponent } from 'react'
import { Router } from 'react-router-dom'
import Routes from '../app/routes'

class AppContainer extends PureComponent {
  render() {
    const { history } = this.props
    return (
      <Router history={history}>
        <Routes />
      </Router>
    )
  }
}

export default AppContainer
