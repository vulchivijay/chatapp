import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import firebase from './../../firebase';

class Login extends React.Component {
  state = {
    email: "",
    password: "",
    errors: [],
    loading: false,
    workplacename: "",
    workplaces: [],
    workplaceRef: firebase.database().ref('workplaces')
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

  displayErrors = errors => errors.map((error, i) => <span key={i}>{error.message}</span>)

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleInputError = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName))? 'error': ''
  }

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ workplacename: this.state.workplacename });

    if (this.isFormValid(this.state)) {
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedInUser => {
          //console.log(signedInUser);
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

  isFormValid = ({workplacename, email, password}) => {
    let errors = [];
    let error;
    let returnFlag = false;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill all the fields!" };
      this.setState({ errors: errors.concat(error) });
      returnFlag = false;
    } else {
      if (workplacename.length > 0) {
        this.state.workplaces.forEach((workplace)=> {
          if (workplace.name === workplacename) {
            returnFlag = true;
          }
        });
        if (!returnFlag) {
          error = { message: "Workplace does not exit!" };
          this.setState({ errors: errors.concat(error) });
        }
      }
    }
    return returnFlag;
  }

  isFormEmpty = ({ workplacename, email, password }) => {
    return !workplacename.length || !email.length || !password.length;
  }

  render() {
    const { email, password, errors, loading, workplacename } = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="user" color="violet"/>
            Login to your workplace
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input fluid name="workplacename" icon="group" iconPosition="left" placeholder="Workplace name" onChange={this.handleChange} value={workplacename} className={this.handleInputError(errors, "workplace")} type="text"/>
              <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email address" onChange={this.handleChange} value={email} className={this.handleInputError(errors, "email")} type="email"/>
              <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} value={password} className={this.handleInputError(errors, "password")} type="password"/>
              <Button disabled={loading} className={loading? 'loading': ''} color="violet" fluid size="large">Submit</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (<Message error><b>Error: </b>{this.displayErrors(errors)} </Message>)}
          <Message>Don't have an workplace? <Link to="/register">Create workplace</Link></Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
