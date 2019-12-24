import React from 'react';
import uuidv4 from 'uuid/v4';
import firebase from './../../firebase';
import { Segment, Button, TextArea } from 'semantic-ui-react';

import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends React.Component {

	state = {
		message: '',
		loading: false,
		channel: this.props.currentChannel,
		user: this.props.currentUser,
		errors: [],
		modal: false,
		uploadState: '',
		uploadTask: null,
		storageRef: firebase.storage().ref(),
		percentUpload: 0,
		typingRef: firebase.database().ref('typing')
	}

	componentWillUnmount() {
		if(this.state.uploadTask !== null) {
			this.state.uploadTask.cancel();
			this.setState({ uploadTask: null });
		}
	}

	openModal = () => this.setState({ modal: true });
	closeModal = () => this.setState({ modal: false });

	handleChange = event => {
		this.setState({[event.target.name]: event.target.value });
	}

	handleKeyUp = event => {
		if (event.ctrlKey && event.keyCode === 13) {
			this.sendMessage();
		}

		const { message, typingRef, channel, user } = this.state;
		if(message && message !== '') {
			typingRef
				.child(channel.id)
				.child(user.uid)
				.set(user.displayName);
		} else {
			typingRef
				.child(channel.id)
				.child(user.uid)
				.remove();
		}
	}

	createMessage = (fileUrl = null) => {
		const message = {
			timestamp: firebase.database.ServerValue.TIMESTAMP,
			user: {
				id: this.state.user.uid,
				name: this.state.user.displayName,
				avatar: this.state.user.photoURL
			}
		};
		if (fileUrl !== null) {
			message['image'] = fileUrl;
		} else {
			message['content'] = this.state.message;
		}
		return message;
	}

	sendMessage = () => {
		const { getMessagesRef } = this.props;
		const { message, channel, typingRef, user } = this.state;

		if (message) {
			this.setState({ loading: true });
			getMessagesRef()
				.child(channel.id)
				.push()
				.set(this.createMessage())
				.then(() => {
					this.setState({ loading: false, message: '', errors: [] })
					typingRef
						.child(channel.id)
						.child(user.uid)
						.remove();
				})
				.catch(err => {
					console.error(err);
					this.setState({
						loading: false,
						errors: this.state.errors.concat(err)
					})
				})
		} else {
			this.setState({
				errors: this.state.errors.concat({ message: 'Add a message '})
			})
		}
	}

	getPath = () => {
		if (this.props.isPrivateChannel) {
			return `chat/private/${this.state.channel.id}`;
		} else {
			return 'chat/public';
		}
	}

	uploadFile = (file, metadata) => {
		const pathToUpload = this.state.channel.id;
		const ref = this.props.getMessagesRef();
		const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

		this.setState({
			uploadState: 'uploading',
			uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
		}, () => {
			this.state.uploadTask.on('state_changed', snap => {
				const percentUpload = ((snap.bytesTransferred / snap.totalBytes) * 100);
				this.setState({ percentUpload });
			}, err => {
					console.error(err);
					this.setState({
						errors: this.state.errors.concat(err),
						uploadState: 'error',
						uploadTask: null
					})
				}, () => {
					this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
						this.sendFileMessage(downloadUrl, ref, pathToUpload);
					})
					.catch(err => {
						console.error(err);
						this.setState({
						errors: this.state.errors.concat(err),
							uploadState: 'error',
							uploadTask: null
						})
					})
					}
				)
			}
		)
	}
	
	sendFileMessage = (fileUrl, ref, pathToUpload) => {
		ref.child(pathToUpload)
			.push()
			.set(this.createMessage(fileUrl))
			.then(() => {
				this.setState({ uploadState: 'done'})
			})
			.catch(err => {
				console.error(err);
				this.setState({
					errors: this.state.errors.concat(err)
				})
			})
	}

	render() {
		const { errors, message, loading, modal, uploadState, percentUpload } = this.state;

		return (
			<Segment className="message__form">
				<TextArea
					name="message"
					value={message}
					onChange={this.handleChange}
					onKeyUp={this.handleKeyUp}
					className={
						errors.some(error => error.message.includes('message')) ? 'error': ''
					}
					placeholder="write your message"
				/>
				<Button.Group icon className="btn-group">
					<Button
						disabled={uploadState === "uploading"}
						onClick={this.openModal}
						icon="attach"
					/>
					<Button
						color="green"
						onClick={this.sendMessage}
						disabled={loading}
						icon="send"
					/>
				</Button.Group>
				<FileModal
					modal={modal}
					closeModal={this.closeModal}
					uploadFile={this.uploadFile}
				/>
				<ProgressBar
					uploadState={uploadState}
					percentUpload={percentUpload}
				/>
			</Segment>
		)
	}
}

export default MessageForm;