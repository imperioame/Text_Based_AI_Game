import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const startNewGame = createAsyncThunk('game/startNew', async () => {
  const response = await axios.post(`${API_URL}/game/new`);
  console.log('API response for new game:', response.data);
  return response.data;
});

export const submitAction = createAsyncThunk('game/submitAction', async (action, { getState }) => {
  const { gameState, gameId, conversationHistory } = getState().game;
  const response = await axios.post(`${API_URL}/game/${gameId}/action`, { 
    gameState,
    action,
    history: conversationHistory
  });
  console.log('API response for action:', response.data);
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
    gameId: null,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(startNewGame.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startNewGame.fulfilled, (state, action) => {
        state.fullStory = action.payload.fullStory;
        state.conversationHistory = action.payload.conversationHistory || [{ type: 'ai', content: action.payload.lastChunk }];
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.gameId = action.payload.id;
        state.loading = false;
        console.log('State after new game:', state);
      })
      .addCase(startNewGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(submitAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAction.fulfilled, (state, action) => {
        state.fullStory = action.payload.fullStory;
        state.conversationHistory.push(
          { type: 'user', content: action.meta.arg },
          { type: 'ai', content: action.payload.lastChunk }
        );
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.loading = false;
        state.loadTime = action.payload.loadTime;
        console.log('State after action:', state);
      })
      .addCase(submitAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default gameSlice.reducer;