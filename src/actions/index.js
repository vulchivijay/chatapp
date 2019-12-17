import * as actionTypes from './types';

/* Users actions types */
export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user
    }
  }
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  }
}

/* Channels actions types */
export const setCurrentChannel = channel => {
	return {
		type: actionTypes.SET_CURRENT_CHANNEL,
		payload: {
			currentChannel: channel
		}
	}
}
