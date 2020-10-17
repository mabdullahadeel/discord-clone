import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import appReducer from '../features/appSlice';

export default configureStore({
  reducer: {
    user: userReducer,
    app: appReducer
  },
  middleware: getDefaultMiddleware({
    serializableCheck: {
      // Ignore these field paths in all actions
      ignoredActionPaths: ['payload.channelCredientials.last_changed'],
      // Ignore these paths in the state
      ignoredPaths: ['app.channelCredientials.last_changed']
    }
  })
});
