import React from 'react';
import firebase from './../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from './../../actions';
import { Menu, Icon, Divider } from 'semantic-ui-react';

class Starred extends React.Component {
	state = {
		starredChannels: [],
		activeChannel: '',
		user: this.props.currentUser,
		usersRef: firebase.database().ref('users')
	}

	componentDidMount () {
		if (this.state.user) {
			this.addListeners(this.state.user.uid);
		}
	}

	componentWillUnmount () {
		this.removeListener();
	}

	removeListener = () => {
		this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
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
				<Icon name="pin" title="channel is pinned!"/> <span>{ channel.name }</span>
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
			<React.Fragment>
				<Menu.Menu className="menu">
					<Menu.Item>
						<span>Starred</span>{" "}
						({ starredChannels.length })
					</Menu.Item>
					{/* Channels */}
					<div className="starred-list scrollBar-container">
						{this.displayChannels(starredChannels)}
					</div>
				</Menu.Menu>
				<Divider/>
			</React.Fragment>
		)
	}
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(Starred);