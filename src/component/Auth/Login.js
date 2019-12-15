import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import './Register.css';
import { Link } from 'react-router-dom';

import firebase from './../../firebase';

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false
  }

  displayErrors = errors => errors.map((error, i) => <span key={i}>{error.message}</span>)

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))? 'error': ''
  }

  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedInUser => {
          console.log(signedInUser);
        })
        .catch(err => {
          console.error(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          })
        })
    }
  }

  isFormValid = ({email, password}) => email && password;

  render() {
    const { email, password, errors, loading } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet"/>
            Login for Dev
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email address" onChange={this.handleChange} value={email} className={this.handleInputError(errors, "email")} type="email"/>
              <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} value={password} className={this.handleInputError(errors, "password")} type="password"/>
              <Button disabled={loading} className={loading? 'loading': ''} color="violet" fluid size="large">Submit</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (<Message error><b>Error: </b>{this.displayErrors(errors)} </Message>)}
          <Message>Don't have an account? <Link to="/register">Register</Link></Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
