import React from 'react';
import './App.css';
import { connect } from 'react-redux';
import { Grid } from 'semantic-ui-react';

// import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
// import MetaPanel from './MetaPanel/MetaPanel';

const App = ({ currentUser, currentChannel, isPrivateChannel, userPosts }) => (
  <Grid colums="equal" className="app">
    <Grid.Row>
      <Grid.Column className="asidePannel">
        <SidePanel
          key={ currentUser && currentUser.uid }
          currentUser={currentUser}
        />
      </Grid.Column>
      <Grid.Column className="chatPannel">
        <Messages
          key={ currentChannel && currentChannel.id }
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
    </Grid.Row>
  </Grid>
);

const mapStateToProps = state => ({
  currentUser: state.user.currentUser,
  currentChannel: state.channel.currentChannel,
  isPrivateChannel: state.channel.isPrivateChannel,
  userPosts: state.channel.userPosts
})

export default connect(mapStateToProps)(App);
