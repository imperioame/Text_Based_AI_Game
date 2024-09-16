import {
  createSlice,
  createAsyncThunk
} from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
  return { message };
};

export const registerUser = createAsyncThunk('user/register', async (userData, {
  rejectWithValue
}) => {
  try {
    const response = await axios.post(`${API_URL}/user/register`, userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const loginUser = createAsyncThunk('user/login', async (credentials, {
  rejectWithValue
}) => {
  try {
    const response = await axios.post(`${API_URL}/user/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
      throw new Error('No token received from server');
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const logoutUser = createAsyncThunk('user/logout', async (_, {
  rejectWithValue
}) => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

export const checkAuth = createAsyncThunk('user/checkAuth', async (_, {
  rejectWithValue
}) => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (token && user) {
      // Verify token with the server
      const response = await axios.get(`${API_URL}/user/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return {
        token,
        user: response.data.user
      };
    }
    throw new Error('No valid credentials found');
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return rejectWithValue(handleApiError(error));
  }
});


export const getUserGames = createAsyncThunk('game/getUserGames', async (_, {
  rejectWithValue,
  getState
}) => {
  try {
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(`${API_URL}/user/games`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(handleApiError(error));
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.token = null;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.currentUser = null;
        state.token = null;
      })
      .addCase(getUserGames.fulfilled, (state, action) => {
        state.userGames = action.payload;
      });
  },
});

export const {
  clearError
} = userSlice.actions;

export default userSlice.reducer;