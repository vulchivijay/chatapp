import React from 'react';
import firebase from './../../firebase';
import { Grid, Header, Icon, Dropdown, Image } from 'semantic-ui-react';

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser
  }

  dropdownOptions = () => [
    {
      key: 'user',
      text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
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
    const {user} = this.state;
    return (
      <Grid style={{margin: 0}}>
        <Grid.Column>
          <Grid.Row style={{margin: 0, padding: '1.2em'}}>
            {/* App header */}
            <Header inverted floated="left" as="h3">
              <Icon name="slack"/>
              <Header.Content>Roomy</Header.Content>
            </Header>
          </Grid.Row>

          {/* User Dropdown */}
          <Header style={{padding: '0.25em'}} as="h4" inverted>
            <Dropdown trigger={
              <span>
                <Image src="{user.photoURL}" spaced="right" avatar />
                {user.displayName}
              </span>
            } options={ this.dropdownOptions() } />
          </Header>
        </Grid.Column>
      </Grid>
    )
  }
}

export default UserPanel;
