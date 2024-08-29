import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
console.log('API_URL:', API_URL);

export const startNewGame = createAsyncThunk('game/startNew', async (_, { rejectWithValue }) => {
  try {
    console.log('Starting new game...');
    const response = await axios.post(`${API_URL}/game/new`);
    console.log('API response for new game:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error starting new game:', error);
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const submitAction = createAsyncThunk('game/submitAction', async (action, { getState, rejectWithValue }) => {
  try {
    const { gameState, gameId, conversationHistory } = getState().game;
    console.log('Submitting action:', action, 'for game:', gameId);
    const response = await axios.post(`${API_URL}/game/${gameId}/action`, { 
      gameState,
      action,
      history: conversationHistory
    });
    console.log('API response for action:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting action:', error);
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const getAvailableModels = createAsyncThunk('game/getAvailableModels', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/game/models`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
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
    error: null,
    availableModels: [],
    userGames: []
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(startNewGame.pending, (state) => {
        console.log('startNewGame.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(startNewGame.fulfilled, (state, action) => {
        console.log('startNewGame.fulfilled:', action.payload);
        state.fullStory = action.payload.fullStory;
        state.conversationHistory = action.payload.conversationHistory || [{ type: 'ai', content: action.payload.lastChunk }];
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.gameId = action.payload.id;
        state.loading = false;
        console.log('State after new game:', state);
      })
      .addCase(startNewGame.rejected, (state, action) => {
        console.log('startNewGame.rejected:', action.error);
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
      })
      .addCase(getAvailableModels.fulfilled, (state, action) => {
        state.availableModels = action.payload;
      })
  },
});

export default gameSlice.reducer;