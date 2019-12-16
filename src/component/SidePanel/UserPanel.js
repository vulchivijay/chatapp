import React from 'react';
import firebase from './../../firebase';
import { Grid, Header, Icon, Dropdown } from 'semantic-ui-react';

class UserPanel extends React.Component {
  dropdownOptions = () => [
    {
      key: 'user',
      text: <span>Signed in as <strong>User</strong></span>,
      disabled: true
    },
    {
      key: 'avatar',
      text: <span>Change Avatar</span>
    },
    {
      key: 'signout',
      text: <span onClick={this.handleSignOut}>Sign out</span>
    }
  ]

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('signned out!');
      })
  }

  render () {
    return (
      <Grid>
        <Grid.Column>
          <Grid.Row style={{margin: 0, padding: '1.2em'}}>
            {/* App header */}
            <Header inverted floated="left" as="h3">
              <Icon name="code"/>
              <Header.Content>DevChat</Header.Content>
            </Header>
          </Grid.Row>

          {/* User Dropdown */}
          <Header style={{padding: '0.25em'}} as="h4" inverted>
            <Dropdown trigger={ <span>User</span> } options={ this.dropdownOptions() } />
          </Header>
        </Grid.Column>
      </Grid>
    )
  }
}

export default UserPanel;
