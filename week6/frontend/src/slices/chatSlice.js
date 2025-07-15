import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  unreadCounts: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUnreadCounts(state, action) {
      state.unreadCounts = action.payload;
    },
    incrementUnread(state, action) {
      const userId = action.payload;
      state.unreadCounts[userId] = (state.unreadCounts[userId] || 0) + 1;
    },
    resetUnread(state, action) {
      const userId = action.payload;
      state.unreadCounts[userId] = 0;
    },
  },
});

export const { setUnreadCounts, incrementUnread, resetUnread } = chatSlice.actions;
export default chatSlice.reducer;