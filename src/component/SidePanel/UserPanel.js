import React from 'react';
import firebase from './../../firebase';
import AvatarEditor from 'react-avatar-editor';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';

class UserPanel extends React.Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: '',
    croppedImage: '',
    blob: '',
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    metadata: {
      contentType: 'image/jpeg'
    },
    uploadedCroppedImage: '',
    usersRef: firebase.database().ref('users')
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  dropdownOptions = () => [
    {
      key: 'user',
      text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
      disabled: true
    },
    {
      key: 'avatar',
      text: <span onClick={this.openModal}>Change Avatar</span>
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

  handleChangeAvatar = event => {
    const file = event.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => {
        this.setState({ previewImage: reader.result });
      });
    }
  }

  handleCropAvatar = event => {
    if (this.avatarEdior) {
      this.avatarEdior.getImageScaledToCanvas().toBlob(blob => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage: imageUrl,
          blob
        });
      });
    }
  }

  uploadCroppedAvatar = () => {
    const { storageRef, userRef, blob, metadata } = this.state;
    storageRef
      .child(`avatars/users/${userRef.uid}`)
      .put(blob, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploadedCroppedImage: downloadURL }, () => this.changeAvatar())
        })
      })
  }

  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedCroppedImage
      })
      .then(() => {
        console.log('photoURL updated');
        this.closeModal();
      })
      .catch(err => {
        console.error(err);
      })

      this.state.usersRef
        .child(this.state.user.uid)
        .update({ avatar: this.state.uploadedCroppedImage })
        .then(() => {
          console.log('user avatar updated');
        })
        .catch(err => {
          console.error(err);
        })
  }

  render () {
    const {user, modal, previewImage, croppedImage} = this.state;
    return (
      <Grid style={{margin: 0}}>
        <Grid.Column>
          {/* User Dropdown */}
          <Grid.Row>
            <Header style={{padding: '0.25em'}} as="h4" inverted>
              <Dropdown trigger={
                <span>
                  <Image src={user.photoURL} spaced="right" avatar />
                  {user.displayName}
                </span>
              } options={ this.dropdownOptions() } />
            </Header>
          </Grid.Row>
          {/* user avatar change */}
          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChangeAvatar}
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {/* image preview */}
                    { previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEdior = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {/* cropped image preview */}
                    {croppedImage && (
                      <Image
                        style={{ margin: '3.5em auto'}}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
              <Button color="green" inverted onClick={this.handleCropAvatar}>
                <Icon name="image" /> Review
              </Button>
              {croppedImage && <Button color="green" inverted onClick={this.uploadCroppedAvatar}>
                <Icon name="save" /> Change avatar
              </Button>}
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    )
  }
}

export default UserPanel;
