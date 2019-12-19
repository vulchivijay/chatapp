import React from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends React.Component {
	render() {
		return (
			<Segment clearing>
				{/* Channel title */}
				<Header fluid="true" as="h2" floated="left" style={{ margin: 0 }}>
					<span>
						Channel
						<Icon name={"star outline"} color="black" />
					</span>
					<Header.Subheader>2 Users</Header.Subheader>
				</Header>
				{/* Channel search input */}
				<Header floated="right">
					<Input
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