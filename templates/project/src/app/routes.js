/**
 * router config
 * 
 * @author <%=author%>
 * @date <%=date%>
 */

import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import asyncComponent from '../components/asyncComponent.jsx'

const NotFound = asyncComponent(() => import('../routes/NotFound'))

class Routes extends Component {
  render() {
    return (
      <Switch>
        <Route component={NotFound}/>
      </Switch>
    )
  }
}

export default Routes