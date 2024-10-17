import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import poemReducer from './poemSlice';
import narrativeReducer from './narrativeSlice';
import bookReducer from './bookSlice';
import coursesReducer from './coursesSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    poems: poemReducer,
    narratives: narrativeReducer,
    book: bookReducer,
    courses: coursesReducer,
  },
});

export default store;