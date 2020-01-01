import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import md5 from 'md5';

import firebase from './../../firebase';

class Register extends React.Component {
  state = {
    workplaceId: "",
    workplacename: "",
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    errors: [],
    loading: false,
    userRef: firebase.database().ref('users'),
    workplaceRef: firebase.database().ref('workplaces')
  }

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      // throw error
      error = { message: "Fill all the fields!" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isPasswordValid(this.state)) {
      // throw error
      error = { message: "Password is invalid!" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else {
      // form is valid
      return true;
    }
  }

  isFormEmpty = ({ workplacename, username, email, password, passwordConfirmation }) => {
    //
    return !workplacename.length || !username.length || !email.length || !password.length || !passwordConfirmation.length;
  }

  isPasswordValid = ({ password, passwordConfirmation }) => {
    //
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return false;
    } else if (password !== passwordConfirmation) {
      return false;
    } else {
      return true;
    }
  }

  displayErrors = errors => errors.map((error, i) => <span key={i}>{error.message}</span>)

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))? 'error': ''
  }

  handleSubmit = event => {
    this.setState({ workplacename: this.state.workplacename });

    if (this.isFormValid()) {
      this.setState({ errors: [], loading: true })
      event.preventDefault();
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser => {
          createdUser.user.updateProfile({
            displayName: this.state.username,
            photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
          })
          .then(() => {
            this.saveUser(createdUser).then(() => {
              this.setState({ loading: false });
            })
          })
          .catch(err => {
            console.error(err);
            this.setState({errors: this.state.errors.concat(err), loading: false });
          })
        })
        .catch(err => {
          console.error(err);
          this.setState({ errors: this.state.errors.concat(err), loading: false });
        })
    }
  }

  saveUser = createdUser => {
    const { workplaceRef, workplacename, email } = this.state;
    const key = workplaceRef.push().key;
    const userId = createdUser.user.uid;
    const userName = createdUser.user.displayName;
    const userAvatar = createdUser.user.photoURL;

    const newWorkplace = {
      id: key,
      name: workplacename,
      createdBy: {
        id: userId,
        name: userName,
        avatar: userAvatar
      },
      users: {
        [userId]: {
          id: userId,
          name: userName,
          email: email,
          avatar: userAvatar
        }
      }
    }

    workplaceRef
      .child(key)
      .update(newWorkplace)
      .then(() => {
        this.setState({workplacename: '',});
      })
      .catch(err => {
        console.error(err);
      });

    return this.state.userRef.child(userId).set({
      name: userName,
      avatar: userAvatar,
      email: this.state.email,
      workplace: {
        id: newWorkplace.id,
        name: newWorkplace.name
      }
    });
  }

  render() {
    const { workplacename, username, email, password, passwordConfirmation, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="user plus" color="orange"/>
            Create workplace account
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="User name" onChange={this.handleChange} value={username} type="text"/>
              <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email address" onChange={this.handleChange} value={email} className={this.handleInputError(errors, "email")} type="email"/>
              <Form.Input fluid name="workplacename" icon="group" iconPosition="left" placeholder="Workplace name" onChange={this.handleChange} value={workplacename} type="text"/>
              <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} value={password} className={this.handleInputError(errors, "password")} type="password"/>
              <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left" placeholder="Password Confirmation" onChange={this.handleChange} value={passwordConfirmation} className={this.handleInputError(errors, "password")} type="password"/>
              <Button disabled={loading} className={loading? 'loading': ''} color="orange" fluid size="large">Submit</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (<Message error><b>Error: </b>{this.displayErrors(errors)} </Message>)}
          <Message>Already a user? <Link to="/login">Login</Link></Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
