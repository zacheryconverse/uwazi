import fetch from 'isomorphic-fetch'
import React, { Component, PropTypes } from 'react'
import { Router, match, RoutingContext, RouteContext } from 'react-router'

import {events} from '../../utils/index'

import Helmet from 'react-helmet'
import { Link } from 'react-router'
import 'bootstrap/dist/css/bootstrap.css'
import './scss/App.scss'
import 'font-awesome/css/font-awesome.css'
import Menu from './Menu.js'

class App extends Component {

  static contextTypes = {getUser: PropTypes.func };

  constructor(props, context) {
    super(props);
    this.fetch = props.fetch || fetch;
    this.state = {user: context.getUser(), showsidebar: false};
    events.on('login', this.fetchUser);
  }

  fetchUser = () => {
    return this.fetch('/api/user', {method:'GET',
                 headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json'
                 },
                 credentials: 'same-origin'})
    .then((response) => response.json())
    .then((response) => {
      this.setState({user: response})
    })
  };

  renderChildren = () => {
    return React.Children.map(this.props.children, (child, index) => {
      return React.cloneElement(child, {user: this.state.user});
    });
  };

  toggleSidebar = () => {
    this.setState({showsidebar: !this.state.showsidebar});
  };

  render = () => {

    let sidebarClass = 'sidebar sidebar-show';

    if(!this.state.showsidebar) {
      sidebarClass = 'sidebar sidebar-hidden';
    }

    return (
      <div>
        <Helmet
          titleTemplate='Uwazi - %s'
          meta={[
            {'char-set': 'utf-8'},
            {'name': 'description', 'content': 'Uwazi docs'}
          ]}
        />

        <nav className="nav  navbar-default navbar-fixed-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link to='/' className="navbar-brand">UwaziDocs</Link>
              <button href="" type="button" className="navbar-toggle"><i className="fa fa-bars"/></button>
            </div>
            <div id="navbar" className="navbar-collapse collapse">
              <Menu className="nav navbar-nav navbar-right" user={this.state.user}/>
            </div>
         </div>
       </nav>
        <div className='container-fluid contents-wrapper'>
            {this.renderChildren()}
        </div>
      </div>
    )
  };
}

export default App;
