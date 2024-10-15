import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import poemReducer from './poemSlice';
import narrativeReducer from './narrativeSlice';
import bookReducer from './bookSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    poems: poemReducer,
    narrative: narrativeReducer,
    book: bookReducer,
  },
});

export default store;