import React from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends React.Component {

	render() {
		const {
			channelName,
			numUniqueUsers,
			handleSearchChange,
			searchLoading,
			isPrivateChannel,
			handleChannelStarred,
			isChannelStarred,
			handleChannelInfo
		} = this.props;

		return (
			<Segment clearing className="messagesHeader">
				{/* Channel title */}
				<Header fluid="true" as="h4" floated="left" style={{ margin: 0 }}>
					<span>
						{channelName}{" "}
						{!isPrivateChannel && channelName && (
							<Icon
								onClick={handleChannelInfo}
								name="info circle"
							/>
						)}
					</span>
					<Header.Subheader>
						{!isPrivateChannel && channelName && (
							<Icon
								onClick={handleChannelStarred}
								name={isChannelStarred ? 'star' : 'star outline'}
								color={isChannelStarred ? 'yellow' : 'black'}
							/>
						)}
						{!isPrivateChannel && channelName && (
							<Icon name="user outline"/>
						)}
						{!isPrivateChannel && channelName ? numUniqueUsers : ''}
						
					</Header.Subheader>
				</Header>
				{/* Channel search input */}
				<Header floated="right">
					<Input
						loading={searchLoading}
						onChange={handleSearchChange}
						size="mini"
						icon="search"
						name="SearchTerm"
						placeholder="Search messages"
					/>
				</Header>
			</Segment>
		);
	}
}

export default MessagesHeader;