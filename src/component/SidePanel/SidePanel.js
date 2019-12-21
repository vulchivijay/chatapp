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
        style={{ background: '#4c3c4c', fontSize: '1.2rem', margin: '0 0 0 46px', borderRadius: 0 }}
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
