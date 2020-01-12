import React from 'react';
import firebase from './../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from './../../actions';
import { Menu, Icon, Divider } from 'semantic-ui-react';

class DirectMessages extends React.Component {
	state = {
		user: this.props.currentUser,
		users: [],
		notifications: [],
		loggedInUser: [],
		usersRef: firebase.database().ref('users'),
		connectedRef: firebase.database().ref('.info/connected'),
		presenceRef: firebase.database().ref('presence'),
		typingRef: firebase.database().ref('typing'),
		messagesRef: firebase.database().ref('messages'),
		activeChannel: '',
		userWorkplaceName: ""
	}

	componentDidMount() {
		if (this.state.user) {
			this.userWorkplaceListeners();
		}
	}

	componentWillUnmount() {
		this.removeListeners();
	}

	removeListeners = () => {
		this.state.usersRef.off();
		this.state.presenceRef.off();
		this.state.connectedRef.off();
	}

	userWorkplaceListeners = () => {
    this.state.usersRef.on('child_added', snap => {
      if (snap.key === this.state.user.uid) {
        this.setState({ userWorkplaceName: snap.val().workplace.name})
				this.addListeners(this.state.user.uid);
      }
    });
  }

	addListeners = currentUserUid => {
		let loadedUsers = [];
		let currentLoggedUser = [];
		this.state.usersRef.on('child_added', snap => {
			if (this.state.userWorkplaceName === snap.val().workplace.name) {
				let user = snap.val();
				user['uid'] = snap.key;
				user['status'] = 'offline';
				if (this.state.user.uid === snap.key) {
					currentLoggedUser.push(user);
					this.setState({ loggedInUser: currentLoggedUser });
				} else {
					loadedUsers.push(user);
					this.setState({ users: loadedUsers });
					this.addNotificationListener(snap.key);
				}
			}
		});

		this.state.connectedRef.on('value', snap => {
			if (snap.val() === true) {
				const ref = this.state.presenceRef.child(currentUserUid);
				ref.set(true);
				ref.onDisconnect().remove(err => {
					if (err !== null) {
						console.error(err);
					}
				});
			}
		});

		this.state.presenceRef.on('child_added', snap => {
			if (currentUserUid !== snap.key || currentUserUid === snap.key) {
				this.addStatusToUser(snap.key);
			}
		});

		this.state.presenceRef.on('child_removed', snap => {
			if (currentUserUid !== snap.key || currentUserUid === snap.key) {
				this.addStatusToUser(snap.key, false);
			}
		});
	}

	addStatusToUser = (userId, connected = true) => {
		const updatedUsers = this.state.users.reduce((acc, user) => {
			if (user.uid === userId) {
				user['status'] = `${connected ? 'online' : 'offline'}`;
			}
			return acc.concat(user);
		}, []);

		this.setState({ users: updatedUsers});

		const updatedLoggedInUsers = this.state.loggedInUser.reduce((acc, user) => {
			if (user.uid === userId) {
				user['status'] = `${connected ? 'online' : 'offline'}`;
			}
			return acc.concat(user);
		}, []);

		this.setState({ loggedInUser: updatedLoggedInUsers});
	}

	isUserOnline = user => user.status === 'online';

	changeChannel = user => {
		const channelId = this.getChannelId(user.uid);
		const channelData = {
			id: channelId,
			name: user.name
		};
		this.clearNotifications();
		this.props.setCurrentChannel(channelData);
		this.props.setPrivateChannel(true);
		this.setActiveChannel(user.uid);
	}

	clearNotifications = () => {
		let index = this.state.notifications.findIndex(notification => notification.id === this.state.user.uid);
		if (index !== -1) {
			let updatedNotifications = [...this.state.notifications];
			updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
			updatedNotifications[index].count = 0;
			this.setState({ notifications: updatedNotifications });
		}
	}

	getNoficationCount = user => {
		let count = 0;
		this.state.notifications.forEach(notification => {
			if (notification.id === user.uid) {
				count = notification.count;
			}
		});

		if (count > 0) return count;
	}
	
	addNotificationListener = userId => {
		this.state.messagesRef.child(userId).on('value', snap => {
			if (this.state.user) {
				this.handleNotifictions(userId, this.state.user.uid, this.state.notifications, snap);
			}
		})
	}

	handleNotifictions = (userId, currentUserUid, notifications, snap) => {
		let lastTotal = 0;
		let index = notifications.findIndex(notification => notification.id === userId);
		if (index !== -1) {
			if (userId !== currentUserUid) {
				lastTotal = notifications[index].total;
				if (snap.numChildren() - lastTotal > 0) {
					notifications[index].count = snap.numChildren() - lastTotal;
				}
			}
			notifications[index].lastKnownTotal = snap.numChildren();
		} else {
			notifications.push({
				id: userId,
				total: snap.numChildren(),
				lastKnownTotal: snap.numChildren(),
				count: 0
			});
		}
		this.setState({ notifications });
	}

	getChannelId = userId => {
		const currentUserId = this.state.user.uid;
		return userId < currentUserId ?
			`${userId}/${currentUserId}` : `${currentUserId}/${userId}`;
	}

	setActiveChannel = userId => {
		// remove active class in channels, starred channels
		this.setState({ activeChannel: userId })
	}

	render() {
		const { users, activeChannel, loggedInUser } = this.state;
		return (
				<Menu.Menu className="menu">
					<Menu.Item>
						<span>Direct messages</span>{" "}({ users.length })
						<Icon name="address book outline" title="Find contacts"/>
					</Menu.Item>
					<div className="message-users-list scrollBar-container">
						{
							loggedInUser.map(user => (
								<Menu.Item
									key={user.uid}
									active={user.uid === activeChannel}
									onClick={() => this.changeChannel(user)}
								>
									<Icon
										name="circle"
										color={this.isUserOnline(user) ? 'green' : 'red'}
									/>
									<span>{user.name } <i>(you)</i></span>
								</Menu.Item>
							))
						}
						{ users.map(user => (
								<Menu.Item
									key={user.uid}
									active={user.uid === activeChannel}
									onClick={() => this.changeChannel(user)}
								>
									<Icon
										name="circle"
										color={this.isUserOnline(user) ? 'green' : 'red'}
									/>
									<span>{user.name}</span>
								</Menu.Item>
							))
						}
					</div>
	      	<Divider/>
				</Menu.Menu>
		)
	}
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(DirectMessages);