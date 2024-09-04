import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { debounce } from 'lodash';

const API_URL = process.env.REACT_APP_API_URL;

// Debounced version of axios.post
const debouncedPost = debounce((url, data, config) => axios.post(url, data, config), 300);

export const startNewGame = createAsyncThunk(
  'game/startNew',
  async (model, { getState, rejectWithValue }) => {
    const { game } = getState();
    if (game.isStartingNewGame) {
      return rejectWithValue('A new game is already being started');
    }
    try {
      const { user } = getState();
      const headers = user.token ? { Authorization: `Bearer ${user.token}` } : {};
      const response = await debouncedPost(`${API_URL}/game/new`, { aiModel: model }, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const submitAction = createAsyncThunk(
  'game/submitAction',
  async (action, { getState, rejectWithValue }) => {
    const { game } = getState();
    if (game.isSubmittingAction) {
      return rejectWithValue('An action is already being submitted');
    }
    try {
      const { user } = getState();
      const headers = user.token ? { Authorization: `Bearer ${user.token}` } : {};
      const response = await debouncedPost(
        `${API_URL}/game/${game.gameId}/action`,
        { action, gameState: game.gameState, history: game.conversationHistory },
        { headers }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

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

export const associateGameWithUser = createAsyncThunk(
  'game/associateWithUser',
  async ({ gameId, userId }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState();
      const response = await axios.post(
        `${API_URL}/game/${gameId}/associate`,
        { userId },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    title: '',
    conversationHistory: [],
    options: [],
    gameState: null,
    loading: false,
    error: null,
    gameId: null,
    availableModels: [],
    userGames: [],
    isStartingNewGame: false,
    isSubmittingAction: false
  },
  reducers: {
    clearGameState: (state) => {
      state.title = '';
      state.conversationHistory = [];
      state.options = [];
      state.gameState = null;
      state.gameId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNewGame.pending, (state) => {
        state.isStartingNewGame = true;
        state.error = null;
      })
      .addCase(startNewGame.fulfilled, (state, action) => {
        state.title = action.payload.title;
        state.conversationHistory = action.payload.conversationHistory || [{ type: 'ai', content: action.payload.lastChunk }];
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.gameId = action.payload.id;
        state.loading = false;
        state.isStartingNewGame = false;
      })
      .addCase(startNewGame.rejected, (state, action) => {
        state.isStartingNewGame = false;
        state.error = action.payload;
      })
      .addCase(submitAction.pending, (state) => {
        state.isSubmittingAction = true;
        state.error = null;
      })
      .addCase(submitAction.fulfilled, (state, action) => {
        state.conversationHistory = action.payload.conversationHistory;
        state.options = action.payload.options;
        state.gameState = action.payload.gameState;
        state.loading = false;
        state.isSubmittingAction = false;
      })
      .addCase(submitAction.rejected, (state, action) => {
        state.isSubmittingAction = false;
        state.error = action.payload;
      })
      .addCase(getAvailableModels.fulfilled, (state, action) => {
        state.availableModels = action.payload;
      })
      .addCase(getUserGames.fulfilled, (state, action) => {
        state.userGames = action.payload;
      })
      .addCase(associateGameWithUser.fulfilled, (state, action) => {
        // Update the current game with the associated user if needed
        if (action.payload.id === state.gameId) {
          state.gameState = { ...state.gameState, userId: action.payload.userId };
        }
        // Update the userGames list if it exists
        if (state.userGames.length > 0) {
          state.userGames = state.userGames.map(game => 
            game.id === action.payload.id ? action.payload : game
          );
        }
      });
  },
});

export const { clearGameState } = gameSlice.actions;

export default gameSlice.reducer;