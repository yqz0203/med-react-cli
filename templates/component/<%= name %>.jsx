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
import cn from 'classnames'

import './style.css'

class <%=name %> extends <%=type %> {
  render() {
    return (
      <div></div>
    )
  }
}

<%=name %>.defaultProps = {
}

<%=name %>.propTypes = {
}


export default <%=name %>