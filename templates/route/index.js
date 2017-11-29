/**
 * index.js
 * 
 * @author <%= author %>
 * @date <%= date %>
 * @modify <%= date %>
 */


import <%= name %> from './{{name}}.jsx'
<%if(redux){%>
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { actions, selector } from '../../modules/<%= name %>'

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

const mapStateToProps = (state) => {
  return {
    <%= name %>: selector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(<%= name %>)
<%}else{%>
export default <%= name %>
<%}%>



