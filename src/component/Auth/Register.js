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
    workplaceRef: firebase.database().ref('workplaces'),
    workplaces: []
  }

  componentDidMount () {
    this.workplaceListeners();
  }

  workplaceListeners = () => {
    let loadedWorkplaces = [];
    this.state.workplaceRef.on('child_added', snap => {
      if (snap.key !== "") {
        let workplaces = snap.val();
        loadedWorkplaces.push(workplaces);
        this.setState({ workplaces: loadedWorkplaces})
      }
    });
  }

  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      // throw error
      error = { message: "Fill all the fields!" };
      this.setState({ errors: errors.concat(error) });
      return false;
    } else if (!this.isWorkplaceAvailable(this.state)) {
      error = { message: "Workplace name not available!" };
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

  isWorkplaceAvailable = ({ workplacename }) => {
    let returnFlag = false;
    this.state.workplaces.forEach((workplace) => {
      if (workplace.name === workplacename) {
        returnFlag = true;
      }
    });
    if (returnFlag) {
      returnFlag = true;
    } else {
      returnFlag = false;
    }
    return returnFlag;
  }

  displayErrors = errors => errors.map((error, i) => <span key={i}>{error.message}</span>)

  handleChange = event => {
    if (event.target.name === "workplacename") {
      this.setState({ [event.target.name]: event.target.value.replace(/\s/g, '').toLowerCase() });
    } else {
      this.setState({ [event.target.name]: event.target.value });
    }
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
    let returnFlag = false;
    const { workplacename } = this.state;
    const userId = createdUser.user.uid;
    const userName = createdUser.user.displayName;
    const userAvatar = createdUser.user.photoURL;
    let dbWorkplaceId;
    let dbWorkplaceName;

    this.state.workplaces.forEach((workplace) => {
      if (workplace.name === workplacename) {
        dbWorkplaceId = workplace.id;
        dbWorkplaceName = workplace.name;
        returnFlag = true;
      }
    });

    return returnFlag ? this.state.userRef.child(userId).set({
      name: userName,
      avatar: userAvatar,
      email: this.state.email,
      workplace: {
        id: dbWorkplaceId,
        name: dbWorkplaceName
      }
    }) : "";
  }

  render() {
    const { workplacename, username, email, password, passwordConfirmation, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="user plus" color="orange"/>
            Create workplace user account
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="User name" onChange={this.handleChange} value={username} type="text"/>
              <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email address" onChange={this.handleChange} value={email} className={this.handleInputError(errors, "email")} type="email"/>
              <Form.Input fluid name="workplacename" icon="group" iconPosition="left" placeholder="Existing workplace name" onChange={this.handleChange} value={workplacename} type="text"/>
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
