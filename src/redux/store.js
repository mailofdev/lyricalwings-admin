import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import poemReducer from './poemSlice';
import narrativeReducer from './narrativeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    poems: poemReducer,
    narrative: narrativeReducer,
  },
});

export default store;