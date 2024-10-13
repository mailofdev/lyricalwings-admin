import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import poemReducer from './poemSlice'
const store = configureStore({
  reducer: {
    auth: authReducer,
    poems: poemReducer,
  },
});

export default store;