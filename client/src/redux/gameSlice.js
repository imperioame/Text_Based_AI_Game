import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const startNewGame = createAsyncThunk('game/startNew', async (model, { getState, rejectWithValue }) => {
  try {
    const { user } = getState();
    const headers = user.token ? { Authorization: `Bearer ${user.token}` } : {};
    const response = await axios.post(`${API_URL}/game/new`, { aiModel: model }, { headers });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

export const submitAction = createAsyncThunk('game/submitAction', async (action, { getState, rejectWithValue }) => {
  try {
    const { game, user } = getState();
    const headers = user.token ? { Authorization: `Bearer ${user.token}` } : {};
    const response = await axios.post(`${API_URL}/game/${game.gameId}/action`, { 
      action,
      gameState: game.gameState,
      history: game.conversationHistory
    }, { headers });
    return response.data;
  } catch (error) {
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

export const getUserGames = createAsyncThunk('game/getUserGames', async (_, { getState, rejectWithValue }) => {
  try {
    const { user } = getState();
    if (!user.token) return [];
    const response = await axios.get(`${API_URL}/user/games`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response ? error.response.data : error.message);
  }
});

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    title: '',
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
        state.loading = true;
        state.error = null;
      })
      .addCase(startNewGame.fulfilled, (state, action) => {
        state.title = action.payload.title;
        state.fullStory = action.payload.fullStory;
        state.conversationHistory = action.payload.conversationHistory || [{ type: 'ai', content: action.payload.lastChunk }];
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.gameId = action.payload.id;
        state.loading = false;
      })
      .addCase(startNewGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAction.fulfilled, (state, action) => {
        state.title = action.payload.title;
        state.fullStory = action.payload.fullStory;
        state.conversationHistory = action.payload.conversationHistory;
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.loading = false;
        state.loadTime = action.payload.loadTime;
      })
      .addCase(submitAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAvailableModels.fulfilled, (state, action) => {
        state.availableModels = action.payload;
      })
      .addCase(getUserGames.fulfilled, (state, action) => {
        state.userGames = action.payload;
      });
  },
});

export default gameSlice.reducer;