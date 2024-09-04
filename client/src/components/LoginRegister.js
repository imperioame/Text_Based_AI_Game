import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser } from '../redux/userSlice';
import { associateGameWithUser } from '../redux/gameSlice';

function LoginRegister() {
  const dispatch = useDispatch();
  const { gameId } = useSelector((state) => state.game);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const result = await dispatch(loginUser(formData)).unwrap();
        if (gameId) {
          await dispatch(associateGameWithUser({ gameId, userId: result.user.id })).unwrap();
        }
      } else {
        const result = await dispatch(registerUser(formData)).unwrap();
        if (gameId) {
          await dispatch(associateGameWithUser({ gameId, userId: result.id })).unwrap();
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="p-4 bg-gray-700 rounded-lg">
      <h2 className="text-xl font-bold text-green-300 mb-4">{isLogin ? 'Login' : 'Register'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-800 text-green-300 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 bg-gray-800 text-green-300 rounded"
        />
        {!isLogin && (
          <>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 text-green-300 rounded"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 text-green-300 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-800 text-green-300 rounded"
            />
          </>
        )}
        <button type="submit" className="w-full px-4 py-2 bg-green-700 text-white rounded hover:bg-green-600 transition-colors duration-200">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>
      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="mt-4 text-green-300 hover:text-green-200"
      >
        {isLogin ? 'Need to register?' : 'Already have an account?'}
      </button>
    </div>
  );
}

export default LoginRegister;