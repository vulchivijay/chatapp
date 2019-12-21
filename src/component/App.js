import React from 'react';
import './App.css';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';

import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';

const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts }) => (
  <Grid colums="equal" className="app" style={{ background: '#eee', margin: 0 }}>
    <Grid.Row style={{padding: 0}}>
      <Grid.Column width={4} stretched>
        {/*<ColorPanel />*/}
        <SidePanel
          key={ currentUser && currentUser.uid }
          currentUser={currentUser}
        />
      </Grid.Column>
      <Grid.Column width={12}>
        <Messages
          key={ currentChannel && currentChannel.id }
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
      {/*<Grid.Column width={3}>
        <MetaPanel
          key={currentChannel && currentChannel.id}
          userPosts={userPosts}
          currentChannel={currentChannel}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>*/}
    </Grid.Row>
  </Grid>
  // <Grid container spacing={3}>
  //   <Grid item xs>
  //     <Paper className={classes.paper}>xs</Paper>
  //   </Grid>
  //   <Grid item xs={6}>
  //     <Paper className={classes.paper}>xs=6</Paper>
  //   </Grid>
  //   <Grid item xs>
  //     <Paper className={classes.paper}>xs</Paper>
  //   </Grid>
  // </Grid>
);

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts
})

export default connect(mapStateToProps)(App);
