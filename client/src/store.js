import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './redux/gameSlice';
import userReducer from './redux/userSlice';

const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
  },
});

export default store;