import React from 'react';
import './App.css';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';

import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';

const App = ({ currentUser }) => (
  <Grid colums="equal" className="app" style={{ background: '#eee', margin: 0 }}>
    <Grid.Row style={{padding: 0}}>
      <Grid.Column width={1}>
        <ColorPanel />
      </Grid.Column>
      <Grid.Column width={3} stretched>
        <SidePanel currentUser={ currentUser }/>
      </Grid.Column>
      <Grid.Column width={9}>
        <Messages />
      </Grid.Column>
      <Grid.Column width={3}>
        <MetaPanel/>
      </Grid.Column>
    </Grid.Row>
  </Grid>
);

const mapStateToProps = state => ({
  currentUser: state.user.currentUser
})

export default connect(mapStateToProps)(App);
