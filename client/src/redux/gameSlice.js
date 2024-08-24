import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const startNewGame = createAsyncThunk('game/startNew', async () => {
  const response = await axios.post(`${API_URL}/game/new`);
  return response.data;
});

export const submitAction = createAsyncThunk('game/submitAction', async (action, { getState }) => {
  const { gameState, gameId, conversationHistory } = getState().game;

  const response = await axios.post(`${API_URL}/game/${gameId}/action`, { 
    gameState,
    action,
    history: conversationHistory
  });
  return response.data;
});

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    fullStory: '',
    conversationHistory: [],
    options: [],
    gameState: null,
    loading: false,
    loadTime: 0,
    gameId: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(startNewGame.pending, (state) => {
        state.loading = true;
      })
      .addCase(startNewGame.fulfilled, (state, action) => {
        state.fullStory = action.payload.fullStory;
        state.conversationHistory = [{ type: 'ai', content: action.payload.newChunk }];
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.gameId = action.payload.id;
        state.loading = false;
      })
      .addCase(submitAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitAction.fulfilled, (state, action) => {
        state.fullStory = action.payload.fullStory;
        state.conversationHistory.push(
          { type: 'user', content: action.meta.arg },
          { type: 'ai', content: action.payload.story }
        );
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.loading = false;
        state.loadTime = action.payload.loadTime;
      });
  },
});

export default gameSlice.reducer;