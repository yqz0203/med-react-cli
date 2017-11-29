/**
 * component <%= name %>.jsx
 * 
 * @author <%= author %>
 * @date <%= date %>
 * @modify <%= date %>
 */
 <% var type = pure ? 'PureComponent' : 'Component' %>

import React, { <%=type %> } from 'react'
import PropType from 'prop-types'

import './style.css'

class <%=name %> extends <%=type %> {
  render() {
    return (
      <div><%=name %></div>
    )
  }
}

<%=name %>.defaultProps = {
}

<%=name %>.propTypes = {
}


export default <%=name %>