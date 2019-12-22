import React from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends React.Component {

	render() {
		const {
			channalName,
			numUniqueUsers,
			handleSearchChange,
			searchLoading,
			isPrivateChannel,
			handleChannelStarred,
			isChannelStarred
		} = this.props;

		return (
			<Segment clearing>
				{/* Channel title */}
				<Header fluid="true" as="h4" floated="left" style={{ margin: 0 }}>
					<span>
						{channalName}
						{!isPrivateChannel && (
							<Icon
								onClick={handleChannelStarred}
								name={isChannelStarred ? 'star' : 'star outline'}
								color={isChannelStarred ? 'yellow' : 'black'}
							/>
						)}
					</span>
					<Header.Subheader>{numUniqueUsers}</Header.Subheader>
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