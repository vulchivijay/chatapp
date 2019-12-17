import React from 'react';
import UserPanel from './UserPanel';
import Channels from './Channels';
import { Menu } from 'semantic-ui-react';

class SidePanel extends React.Component {
  render () {
    const { currentUser } = this.props

    return (
      <Menu
        size="large"
        inverted
        vertical
        style={{ background: '#4c3c4c', fontSize: '1.2rem', margin: 0, borderRadius: 0 }}
      >
        <UserPanel currentUser={currentUser} />
        <Channels currentUser={currentUser} />
      </Menu>
    )
  }
}

export default SidePanel;
