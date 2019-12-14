import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import './Register.css';
import { Link } from 'react-router-dom';

class Register extends React.Component {
  state = {}

  handleChange = () => {}

  render() {
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange"/>
            Register for Dev
          </Header>
          <Form size="large">
            <Segment stacked>
              <Form.Input fluid name="username" icon="user" iconPosition="left" placeholder="User name" onChange={this.handleChange} type="text"/>
              <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email address" onChange={this.handleChange} type="email"/>
              <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} type="password"/>
              <Form.Input fluid name="passwordConfirmation" icon="repeat" iconPosition="left" placeholder="Password Confirmation" onChange={this.handleChange} type="email"/>
              <Button color="green" fluid size="large">Submit</Button>
            </Segment>
            <Message>Already a user? <Link to="/login">Login</Link></Message>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
