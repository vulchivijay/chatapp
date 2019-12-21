import React from 'react';
import { Menu } from 'semantic-ui-react';

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
        <Starred currentUser={currentUser} />
        <Channels currentUser={currentUser} />
        <DirectMessages currentUser={currentUser} />
      </Menu>
    )
  }
}

export default SidePanel;
