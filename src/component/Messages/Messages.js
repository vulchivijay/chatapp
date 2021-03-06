import React from 'react';
import { Segment, Comment, Icon, Divider } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setUserPosts } from './../../actions';
import firebase from './../../firebase';

import MetaPanel from './../MetaPanel/MetaPanel';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Typing from './Typing';

class Messages extends React.Component {
	state = {
		messagesRef: firebase.database().ref('messages'),
		messages: [],
		messagesLoading: true,
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		numUniqueUsers: '',
		searchTerm: '',
		searchLoading: false,
		searchResults: [],
		privateChannel: this.props.isPrivateChannel,
		privateMessagesRef: firebase.database().ref('privateMessages'),
		isChannelStarred: false,
		usersRef: firebase.database().ref('users'),
		typingUsers: [],
		typingRef: firebase.database().ref('typing'),
		connectedRef: firebase.database().ref('.info/connected'),
		userPosts: this.props.userPosts,
		openChannelInfo: false,
		listeners: [],
		arrowDown: false
	}

	componentDidMount() {
		const { channel, user, listeners } = this.state;
		if (channel && user) {
			this.removeListeners(listeners)
			this.addListeners(channel.id);
			this.addUserStarredListeners(channel.id, user.uid);
		}
	}

	componentWillUnmount () {
		this.removeListeners(this.state.listeners);
		this.state.connectedRef.off();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.messagesEnd) {
			//this.state.arrowDown = true;
			this.scrollToBottom();
		}
	}

	scrollToBottom = () => {
		this.messagesEnd.scrollIntoView({ behavior: 'smooth'});
		// this.state.arrowDown = false;
	}

	removeListeners = listeners => {
		listeners.forEach(listener => {
			listener.ref.child(listener.id).off(listener.event);	
		});
	}

	addToListeners = (id, ref, event) => {
		const index = this.state.listeners.findIndex(listener => {
			return listener.id === id && listener.ref === ref && listener.event === event;
		})

		if (index === -1) {
			const newListener = { id, ref, event };
			this.setState({ listeners: this.state.listeners.concat(newListener) });
		}
	}

	addListeners = channelId => {
		this.addMessageListeners(channelId);
		this.addTypingListeners(channelId);
	}

	addTypingListeners = channelId => {
		let typingUsers = [];
		this.state.typingRef.child(channelId).on('child_added', snap => {
			if (snap.key !== this.state.user.uid) {
				typingUsers = typingUsers.concat({
					id: snap.key,
					name: snap.val()
				})
				this.setState({ typingUsers });
			}
		});

		this.addToListeners(channelId, this.state.typingRef, 'child_added');

		this.state.typingRef.child(channelId).on('child_removed', snap => {
			const index = typingUsers.findIndex(user => user.id === snap.key);
			if (index !== -1) {
				typingUsers = typingUsers.filter(user => user.id !== snap.key);
				this.setState({ typingUsers });
			}
		});

		this.addToListeners(channelId, this.state.typingRef, 'child_removed');

		this.state.connectedRef.on('value', snap => {
			if (snap.val() === true) {
				this.state.typingRef
					.child(channelId)
					.child(this.state.user.uid)
					.onDisconnect()
					.remove(err => {
						if (err !== null) {
							console.error(err);
						}
					})
			}
		})
	}

	addUserStarredListeners = (channelId, userId) => {
		this.state.usersRef
			.child(userId)
			.child('starred')
			.once('value')
			.then(data => {
				if (data.val() !== null) {
					const channelIds = Object.keys(data.val());
					const prevStarred = channelIds.includes(channelId);
					this.setState({ isChannelStarred: prevStarred });
				}
			})
	}

	addMessageListeners = channelId => {
		let loadedMessages = [];
		const ref = this.getMessagesRef();
		ref.child(channelId).on("child_added", snap => {
			loadedMessages.push(snap.val());
			this.setState({
				messages: loadedMessages,
				messagesLoading: false
			});
			this.countUniqueUsers(loadedMessages);
			this.countUsersPosts(loadedMessages);
		});

		this.addToListeners(channelId, ref, 'child_added');
	};

	getMessagesRef = () => {
		const { messagesRef, privateMessagesRef, privateChannel } = this.state;
		return privateChannel ? privateMessagesRef : messagesRef;
	}

	countUniqueUsers = messages => {
		const uniqueUsers = messages.reduce((acc, message) => {
			if (!acc.includes(message.user.name)) {
				acc.push(message.user.name);
			}
			return acc;
		}, []);
		const numUniqueUsers = `${uniqueUsers.length}`
		this.setState({numUniqueUsers});
	}

	countUsersPosts = messages => {
		let userPosts = messages.reduce((acc, message) => {
			if (message.user.name in acc) {
				acc[message.user.name].count += 1;
			} else {
				acc[message.user.name] = {
					avatar: message.user.avatar,
					count: 1
				}
			}
			return acc;
		}, {});
		this.props.setUserPosts(userPosts);
	}

	handleSearchChange = event => {
		this.setState({
			searchTerm: event.target.value,
			searchLoading: true
		}, () => this.handleSearchMessage());
	}

	handleSearchMessage = () => {
		const channelMessages = [...this.state.messages];
		const regex = new RegExp(this.state.searchTerm, 'gi');
		const searchResults = channelMessages.reduce((acc, message) => {
			if ((message.content && message.content.match(regex)) || (message.content && message.user.name.match(regex))) {
				acc.push(message);
			}
			return acc;
		}, []);
		this.setState({ searchResults });
		setTimeout(() => this.setState({ searchLoading: false }), 1000);
	}

	handleChannelStarred = () => {
		this.setState(prevState => ({
			isChannelStarred: !prevState.isChannelStarred
		}), () => this.starChannel());
	}

	handleChannelInfo = () => {
		if (this.state.openChannelInfo) {
			this.setState({ openChannelInfo: false });
		} else {
			this.setState({ openChannelInfo: true });
		}
	}

	starChannel = () => {
		if (this.state.isChannelStarred) {
			this.state.usersRef
				.child(`${this.state.user.uid}/starred`)
				.update({
					[this.state.channel.id]: {
						name: this.state.channel.name,
						details: this.state.channel.details,
						createdBy: {
							name: this.state.channel.createdBy.name,
							avatar: this.state.channel.createdBy.avatar
						}
					}
				});
		} else {
			this.state.usersRef
				.child(`${this.state.user.uid}/starred`)
				.child(this.state.channel.id)
				.remove(err => {
					console.error(err);
				})
		}
	}

	displayMessages = messages => (
		messages.length > 0 && messages.map(message => (
			<Message
				key={message.timestamp}
				message={message}
				user={this.state.user}
			/>
		))
	)

	displayChannelName = channel => {
		return channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';
	}

	displayDraftUserMesssage = (user, channel) => {
		if (channel != null && user.displayName === channel.name) {
			return (<div>
				<p> <strong>This is your space</strong>. Draft messages, make to-do lists or keep links and files to hand. You can also talk to yourself here, but please bear in mind you’ll have to provide both sides of the conversation.</p>
			<Divider/></div>);
		}
	}

	displayTypingUsers = users => (
		users.length > 0 && users.map(user => (
			<div style={{ display: "flex", alignItems: "center", marginBottom: '0.2em' }} key={user.id}>
				<span className="user__typing">{user.name} is typing</span> <Typing />
			</div>
		))
	)

	render () {
		const {
			messagesRef,
			messages,
			channel,
			user,
			numUniqueUsers,
			searchTerm,
			searchResults,
			searchLoading,
			privateChannel,
			isChannelStarred,
			typingUsers,
			userPosts,
			openChannelInfo,
			arrowDown
		} = this.state;
		return (
			<React.Fragment>
				<MessagesHeader
					channelName={this.displayChannelName(channel)}
					numUniqueUsers={numUniqueUsers}
					handleSearchChange={this.handleSearchChange}
					searchLoading={searchLoading}
					isPrivateChannel={privateChannel}
					handleChannelStarred={this.handleChannelStarred}
					isChannelStarred={isChannelStarred}
					handleChannelInfo={this.handleChannelInfo}
				/>
				<div className={openChannelInfo ? 'messagesContainer showChannelInfo' : 'messagesContainer'}>
					<div>
						<Segment className="messages">
							{this.displayDraftUserMesssage(user, channel)}
							<Comment.Group>
								{ searchTerm ? this.displayMessages(searchResults) :
									this.displayMessages(messages) }
								{ this.displayTypingUsers(typingUsers) }
								<div ref={node => (this.messagesEnd = node)}></div>
							</Comment.Group>
						</Segment>
						<MessageForm
							messagesRef={messagesRef}
							currentChannel={channel}
							currentUser={user}
							isPrivateChannel={privateChannel}
							getMessagesRef={this.getMessagesRef}
						/>
						<div className={arrowDown ? 'arrowDown show' : 'arrowDown hide'}>
							<Icon name="arrow alternate circle down outline" title="move to bottom"></Icon>
						</div>
					</div>
					<div>
						<MetaPanel
		          key={channel && channel.id}
		          userPosts={userPosts}
		          currentChannel={channel}
		          isPrivateChannel={privateChannel}
				    />
			    </div>
				</div>
			</React.Fragment>
		)
	}
}

export default connect(null, {setUserPosts})(Messages);
