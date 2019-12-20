import React from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends React.Component {

	render() {
		const {
			channalName,
			numUniqueUsers,
			handleSearchChange,
			searchLoading,
			isPrivateChannel
		} = this.props;

		return (
			<Segment clearing>
				{/* Channel title */}
				<Header fluid="true" as="h2" floated="left" style={{ margin: 0 }}>
					<span>
						{channalName}
						{!isPrivateChannel && <Icon name={"star outline"} color="black" />}
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