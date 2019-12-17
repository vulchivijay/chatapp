import React from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

class Channels extends React.Component {
	state = {
		channels: [],
		channelName: '',
		channelDetails: '',
		modal: false
	}

	handleChange = event => {
		this.setState({[event.target.name]: event.target.value })
	}

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	render () {
		const { channels, modal } = this.state;

		return (
			<React.Fragment>
				<Menu.Menu>
					<Menu.Item>
						<span>
							<Icon name="exchange" /> CHANNELS
						</span>{" "}
						({ channels.length }) <Icon name="add" onClick={this.openModal}/>
					</Menu.Item>
					{/* Channels */}

				</Menu.Menu>
				{/* Modal popup */}
				<Modal basic open={modal} onClose={this.closeModal}>
					<Modal.Header>Add a Channel </Modal.Header>
					<Modal.Content>
						<Form>
							<Form.Field>
								<Input
									fluid
									label="Channel name"
									name="channelName"
									onChange={this.handleChange}

								/>
							</Form.Field>
							<Form.Field>
								<Input
									fluid
									label="About channel"
									name="channelDetails"
									onChange={this.handleChange}

								/>
							</Form.Field>
						</Form>
					</Modal.Content>
					<Modal.Actions>
						<Button color="red" inverted onClick={this.closeModal}>
							<Icon name="remove" /> Cancel
						</Button>
						<Button color="green" inverted>
							<Icon name="checkmark" /> Add
						</Button>
					</Modal.Actions>
				</Modal>
			</React.Fragment>
		);
	}
}

export default Channels;