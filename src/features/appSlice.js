import { createSlice } from '@reduxjs/toolkit';

export const appSlice = createSlice({
    name: 'app',
    initialState: {
        channelId: null,
        channelCredientials: null,
    },
    reducers: {
        setChannelInfo: (state, action) => {
            state.channelId = action.payload.channelId;
            state.channelCredientials = action.payload.channelCredientials;
        },
    },
});


export const { setChannelInfo } = appSlice.actions;

export const selectChannelId = (state) => state.app.channelId;
export const seletChannelName = (state) => state.app.channelCredientials;

export default appSlice.reducer;
