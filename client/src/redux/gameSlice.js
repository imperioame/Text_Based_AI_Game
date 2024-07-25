// client/src/redux/gameSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export const startNewGame = createAsyncThunk('game/startNew', async () => {
  // TODO: Implement API call to start a new game
});

export const continueGame = createAsyncThunk('game/continue', async (gameId) => {
  // TODO: Implement API call to continue an existing game
});

export const submitAction = createAsyncThunk('game/submitAction', async (action, { getState }) => {
  // TODO: Implement API call to submit user action and get next story segment
});

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    currentStory: '',
    options: [],
    gameState: null,
    savedGames: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(startNewGame.fulfilled, (state, action) => {
        // TODO: Update state with new game data
      })
      .addCase(continueGame.fulfilled, (state, action) => {
        // TODO: Update state with continued game data
      })
      .addCase(submitAction.fulfilled, (state, action) => {
        // TODO: Update state with new story segment and options
      });
  },
});

export default gameSlice.reducer;