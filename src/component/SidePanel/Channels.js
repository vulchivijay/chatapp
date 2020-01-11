import React from 'react';
import firebase from './../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from './../../actions';
import { Menu, Icon, Modal, Form, Input, Button, Label, Checkbox } from 'semantic-ui-react';

class Channels extends React.Component {
	state = {
		user: this.props.currentUser,
		modal: false,
		firstLoad: true,
		channel: null,
		isPrivate: false,
		notifications: [],
		channels: [],
		userWorkplaceName: "",
		channelName: "",
		channelDetails: "",
		activeChannel: "",
		channelsRef: firebase.database().ref('channels'),
		messagesRef: firebase.database().ref('messages'),
		typingRef: firebase.database().ref('typing'),
		usersRef: firebase.database().ref('users')
	}

	handleChange = event => {
		if (event.target.name === "channelName") {
			this.setState({ [event.target.name]: event.target.value.replace(/\s/g, '').toLowerCase() });
		} else {
			this.setState({ [event.target.name]: event.target.value });
		}
	}

	isPrivate = (event, data) => {
		this.setState({ isPrivate: data.checked });
	}

	handleSubmit = event => {
		event.preventDefault();
		if (this.isFormvalid(this.state)) {
			this.addChannel();
		}
		this.setState({ isPrivate: false });
	}

	changeChannel = channel => {
		this.setActiveChannel(channel);
		this.state.typingRef
			.child(this.state.channel.id)
			.child(this.state.user.uid)
			.remove();
		this.clearNotifications();
		this.props.setCurrentChannel(channel);
		this.props.setPrivateChannel(false);
		this.setState({ channel });
	}

	clearNotifications = () => {
		let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id);
		if (index !== -1) {
			let updatedNotifications = [...this.state.notifications];
			updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
			updatedNotifications[index].count = 0;
			this.setState({ notifications: updatedNotifications });
		}
	}

	getNoficationCount = channel => {
		let count = 0;
		this.state.notifications.forEach(notification => {
			if (notification.id === channel.id) {
				count = notification.count;
			}
		});

		if (count > 0) return count;
	}

	setActiveChannel = channel => {
		// remove active class in direct messages, starred channels
		this.setState({ activeChannel: channel.id })
	}

	displayPrivateChannels = (channels, user) => (
		channels.length > 0 && channels.map(channel => (
			(channel.createdBy.name === user.displayName && channel.is_private) ? <Menu.Item
				key={channel.id}
				onClick={() => this.changeChannel(channel)}
				name={channel.name}
				active={channel.id === this.state.activeChannel}
			>
				{this.getNoficationCount(channel) && (
					<Label color="red">{this.getNoficationCount(channel)}</Label>
				)}
				<Icon name="lock" title="Private channel"/> {channel.name}
			</Menu.Item>
			: ""
		))
	)

	displayPublicChannels = (channels, user) => (
		channels.length > 0 && channels.map(channel => (
			(!channel.is_private) ? <Menu.Item
				key={channel.id}
				onClick={() => this.changeChannel(channel)}
				name={channel.name}
				active={channel.id === this.state.activeChannel}
			>
				{this.getNoficationCount(channel) && (
					<Label color="red">{this.getNoficationCount(channel)}</Label>
				)}
				# {channel.name}
			</Menu.Item>
			: ""
		))
	)

	channelsCount = (channels, user) => {
		let Count = 0;
		if (channels.length > 0) {
			channels.forEach(channel => {
				if (channel.createdBy.name === user.displayName)
					Count++;
				if (channel.createdBy.name !== user.displayName && !channel.is_private)
					Count++;
			})
			return Count;
		}
	}

	componentDidMount () {
		this.addListeners();
		this.userWorkplaceListeners();
	}

	componentWillUnmount () {
		this.removeListeners();
	}

	addListeners = () => {
		let loadedchannels = [];
		this.state.channelsRef.on('child_added', snap => {
			loadedchannels.push(snap.val());
			this.setState({channels: loadedchannels}, () => this.setFirstChannel());
			this.addNotificationListener(snap.key);
		});
	}

	userWorkplaceListeners = () => {
    this.state.usersRef.on('child_added', snap => {
      if (snap.key === this.state.user.uid) {
        this.setState({ userWorkplaceName: snap.val().workplace.name})
      }
    });
  }

	addNotificationListener = channelId => {
		this.state.messagesRef.child(channelId).on('value', snap => {
			if (this.state.channel) {
				this.handleNotifictions(channelId, this.state.channel.id, this.state.notifications, snap);
			}
		})
	}

	handleNotifictions = (channelId, currentChannelId, notifications, snap) => {
		let lastTotal = 0;
		let index = notifications.findIndex(notification => notification.id === channelId);
		if (index !== -1) {
			if (channelId !== currentChannelId) {
				lastTotal = notifications[index].total;
				if (snap.numChildren() - lastTotal > 0) {
					notifications[index].count = snap.numChildren() - lastTotal;
				}
			}
			notifications[index].lastKnownTotal = snap.numChildren();
		} else {
			notifications.push({
				id: channelId,
				total: snap.numChildren(),
				lastKnownTotal: snap.numChildren(),
				count: 0
			});
		}
		this.setState({ notifications });
	}

	removeListeners = () => {
		this.state.channelsRef.off();
		this.state.channels.forEach(channel => {
			this.state.messagesRef.child(channel.id).off();
		});
	};

	setFirstChannel = () => {
		let firstChannel;
		let channelsNotEmpty = this.state.firstLoad && this.state.channels.length > 0 ? true : false
		this.state.channels.forEach( (channel, index) => {
			if (channelsNotEmpty && channel.createdBy.name === this.state.user.displayName) {
				firstChannel = this.state.channels[index];
				this.props.setCurrentChannel(firstChannel);
				this.setActiveChannel(firstChannel);
				this.setState({ channel: firstChannel });
				this.setState({ firstLoad: false });
				return false;
			}
		});
	}

	addChannel = () => {
		const { channelsRef, channelName, channelDetails, user, userWorkplaceName, isPrivate } = this.state;

		const key = channelsRef.push().key;

		const newChannel = {
			id: key,
			name: channelName,
			details: channelDetails,
			workplaceName: userWorkplaceName,
			is_private: isPrivate,
			createdBy: {
				id: user.uid,
				name: user.displayName,
				avatar: user.photoURL
			}
		}

		channelsRef
			.child(key)
			.update(newChannel)
			.then(() => {
				this.setState({channelName: '', channelDetails: ''});
				this.closeModal();
			})
			.catch(err => {
				console.error(err);
			});
	}

	isFormvalid = ({ channelName, channelDetails, channels }) => {
		let returnFlag = false;
		if (channelName.length > 0 && channelDetails.length> 0) {
			channels.forEach( channel => {
				if (channel.name === channelName) {
					returnFlag = true;
				}
			});
		}
		if (returnFlag) {
			return false;
		} else {
			return true;
		}
	}

	openModal = () => this.setState({ modal: true });

	closeModal = () => this.setState({ modal: false });

	render () {
		const { channels, modal, user, channelName, channelDetails } = this.state;

		return (
			<React.Fragment>
				<Menu.Menu className="menu">
					<Menu.Item>
						<span> Channels </span>{" "}
						({ this.channelsCount(channels, user) })
						<Icon name="users" onClick={this.openModal} title="add channel"/>
					</Menu.Item>
					{/* Channels */}
					<div className="channels-list scrollBar-container">
						{this.displayPrivateChannels(channels, user)}
						{this.displayPublicChannels(channels, user)}
					</div>
				</Menu.Menu>
				{/* Modal popup */}
				<Modal basic open={modal} onClose={this.closeModal}>
					<Modal.Header>Add a Channel </Modal.Header>
					<Modal.Content>
						<Form onSubmit={this.handleSubmit}>
							<Form.Field>
								<Input
									fluid
									label="Channel name"
									name="channelName"
									value={channelName}
									onChange={this.handleChange}
								/>
							</Form.Field>
							<Form.Field>
								<Input
									fluid
									label="About channel"
									name="channelDetails"
									value={channelDetails}
									onChange={this.handleChange}
								/>
							</Form.Field>
							<Form.Field>
						    <Checkbox
						    	toggle
						    	label="Is private?"
						    	name="isPrivate"
									onChange={this.isPrivate}
								/>
							</Form.Field>
						</Form>
					</Modal.Content>
					<Modal.Actions>
						<Button color="red" inverted onClick={this.closeModal}>
							<Icon name="remove" /> Cancel
						</Button>
						<Button color="green" inverted onClick={this.handleSubmit}>
							<Icon name="checkmark" /> Add
						</Button>
					</Modal.Actions>
				</Modal>
			</React.Fragment>
		);
	}
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Channels);