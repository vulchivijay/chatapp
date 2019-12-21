<Grid colums="equal" className="app" style={{ background: '#eee', margin: 0 }}>
    <Grid.Row style={{padding: 0}}>
      <Grid.Column width={3} stretched>
        {/*<ColorPanel />*/}
        <SidePanel
          key={ currentUser && currentUser.uid }
          currentUser={currentUser}
        />
      </Grid.Column>
      <Grid.Column width={13}>
        <Messages
          key={ currentChannel && currentChannel.id }
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
      {/*<Grid.Column width={3}>
        <MetaPanel
          key={currentChannel && currentChannel.id}
          userPosts={userPosts}
          currentChannel={currentChannel}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>*/}
    </Grid.Row>
  </Grid>