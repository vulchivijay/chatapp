import React from 'react';
import { Menu, Divider } from 'semantic-ui-react';

import UserPanel from './UserPanel';
import Starred from './Starred';
import Channels from './Channels';
import DirectMessages from './DirectMessages';

class SidePanel extends React.Component {
  render () {
    const { currentUser } = this.props;

    return (
      <Menu
        size="large"
        inverted
        vertical
      >
        <UserPanel currentUser={currentUser} />
        <Divider style={{ marginTop: 0}}/>
        <Starred currentUser={currentUser} />
        <Divider/>
        <Channels currentUser={currentUser} />
        <Divider/>
        <DirectMessages currentUser={currentUser} />
        <Divider/>
      </Menu>
    )
  }
}

export default SidePanel;
