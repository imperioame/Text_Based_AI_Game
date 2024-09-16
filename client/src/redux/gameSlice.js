import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { debounce } from 'lodash';

const API_URL = process.env.REACT_APP_API_URL;
console.log(API_URL);


// Debounced version of axios.post
const debouncedPost = debounce((url, data, config) => axios.post(url, data, config), 300);

export const startNewGame = createAsyncThunk(
  'game/startNew',
  async (model, { dispatch, rejectWithValue }) => {
    try {
      // Clear the game state before starting a new game
      dispatch(clearGameState());
      const response = await axios.post(`${API_URL}/game/new`, { aiModel: model });
      return response.data;
    } catch (error) {
      console.error('Error in startNewGame:', error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const submitAction = createAsyncThunk(
  'game/submitAction',
  async (action, { getState, rejectWithValue }) => {
    try {
      const { game, user } = getState();
      const headers = user.token ? { Authorization: `Bearer ${user.token}` } : {};
      const response = await axios.post(
        `${API_URL}/game/${game.gameId}/action`,
        { action, gameState: game.gameState, history: game.conversationHistory },
        { headers }
      );
      //While debouncing can be useful in some cases, it might be causing issues with the timing of our requests and responses.
      /*const response = await debouncedPost(
        `${API_URL}/game/${game.gameId}/action`,
        { action, gameState: game.gameState, history: game.conversationHistory },
        { headers }
      );*/
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
      //return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const getAvailableModels = createAsyncThunk(
  'game/getAvailableModels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/game/models`);
      return response.data.map(model => ({
        ...model,
        repo: model.repo || model.name.toLowerCase().replace(/\s+/g, '-')
      }));
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

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
    isSubmittingAction: false,
  },
  reducers: {
    clearGameState: (state) => {
      state.title = '';
      state.conversationHistory = [];
      state.options = [];
      state.gameState = null;
      state.gameId = null;
      state.isStartingNewGame = false;
      state.isSubmittingAction = false;
      state.error = null;
      state.loading = true;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(startNewGame.pending, (state) => {
      state.isStartingNewGame = true;
      state.loading = true;
      state.error = null;
    })
    .addCase(startNewGame.fulfilled, (state, action) => {
      const gameData = action.payload.data; // Access the 'data' object from the response
      state.loading = false;
      state.isStartingNewGame = false;
      state.error = null;
      state.title = gameData.title;
      state.conversationHistory = gameData.conversationHistory;
      state.options = gameData.options;
      state.gameState = gameData.gameState;
      state.gameId = gameData.id;
    })
    .addCase(startNewGame.rejected, (state, action) => {
      state.isStartingNewGame = false;
      state.loading = false;
      state.error = action.payload?.message || 'An unexpected error occurred';
    })
    .addCase(submitAction.pending, (state) => {
      state.isSubmittingAction = true;
      state.loading = true;
      state.error = null;
    })
    .addCase(submitAction.fulfilled, (state, action) => {
      state.conversationHistory = action.payload.conversationHistory;
      state.options = action.payload.options;
      state.gameState = action.payload.gameState;
      state.isSubmittingAction = false;
      state.loading = false;
      state.error = null;
    })
    .addCase(submitAction.rejected, (state, action) => {
      state.isSubmittingAction = false;
      state.loading = false;
      state.error = action.payload?.message || 'An unexpected error occurred';
    })
    .addCase(getAvailableModels.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getAvailableModels.fulfilled, (state, action) => {
      state.loading = false;
      state.availableModels = action.payload;
    })
    .addCase(getAvailableModels.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'An unexpected error occurred';
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

export const { clearGameState, clearError } = gameSlice.actions;

export default gameSlice.reducer;