import React from 'react';
import firebase from './../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from './../../actions';
import { Menu } from 'semantic-ui-react';

class Starred extends React.Component {
	state = {
		starredChannels: [],
		activeChannel: '',
		user: this.props.currentUser,
		usersRef: firebase.database().ref('users')
	}

	componentDidMount() {
		if (this.state.user) {
			this.addListeners(this.state.user.uid);
		}
	}

	addListeners = userId => {
		this.state.usersRef
			.child(userId)
			.child('starred')
			.on('child_added', snap => {
				const starredChannel = { id: snap.key, ...snap.val() };
				this.setState({
					starredChannels: [...this.state.starredChannels, starredChannel]
				});
			});
		this.state.usersRef
			.child(userId)
			.child('starred')
			.on('child_removed', snap => {
				const channelToRemove = { id: snap.key, ...snap.val() };
				const filteredChannels = this.state.starredChannels.filter(channel => {
					return channel.id !== channelToRemove.id;
				});
				this.setState({ starredChannels: filteredChannels });
			})
	}

	displayChannels = starredChannels => (
		starredChannels.length > 0 && starredChannels.map(channel => (
			<Menu.Item
				key={channel.id}
				onClick={() => this.changeChannel(channel)}
				name={channel.name}
				active={channel.id === this.state.activeChannel}
			>
				# { channel.name }
			</Menu.Item>
		))
	)

	changeChannel = channel => {
		this.setActiveChannel(channel);
		this.props.setCurrentChannel(channel);
		this.props.setPrivateChannel(false);
	}

	setActiveChannel = channel => {
		this.setState({ activeChannel: channel.id })
	}

	render () {
		const { starredChannels } = this.state;
		return (
			<Menu.Menu className="menu">
				<Menu.Item>
					<span>Starred</span>{" "}
					({ starredChannels.length })
				</Menu.Item>
				{/* Channels */}
				{this.displayChannels(starredChannels)}
			</Menu.Menu>
		)
	}
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred);