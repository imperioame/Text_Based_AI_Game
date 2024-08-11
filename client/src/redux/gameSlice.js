import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const startNewGame = createAsyncThunk('game/startNew', async () => {
  const response = await axios.post(`${API_URL}/game/new`);
  console.log('response data (returned)', response.data);
  return response.data;
});

export const continueGame = createAsyncThunk('game/continue', async (gameId) => {
  const response = await axios.get(`${API_URL}/game/${gameId}`);
  return response.data;
});

export const submitAction = createAsyncThunk('game/submitAction', async (action, { getState }) => {
  const { gameId } = getState().game;
  const response = await axios.post(`${API_URL}/game/${gameId}/action`, { action });
  return response.data;
});

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    currentStory: '',
    options: [],
    gameState: null,
    gameId: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(startNewGame.fulfilled, (state, action) => {
        state.currentStory = action.payload.story;
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.gameId = action.payload.id;
      })
      .addCase(continueGame.fulfilled, (state, action) => {
        state.currentStory = action.payload.story;
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
      })
      .addCase(submitAction.fulfilled, (state, action) => {
        //state.currentStory += '\n\n' + action.payload.story;
        state.currentStory = action.payload.story;
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
      });
  },
});

export default gameSlice.reducer;
