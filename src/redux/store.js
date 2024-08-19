// store.js
import { configureStore } from '@reduxjs/toolkit';
import aboutReducer from './aboutSlice';
import userAuthReducer from './userAuthSlice';
import dashboardReducer from './dashboardSlice';
import courseReducer from './courseSlice';
import booksReducer from './booksSlice';
import { NarrativesReducer } from './NarrativesSlice';
import { poemReducer } from './poemSlice';

const store = configureStore({
  reducer: {
    about: aboutReducer,
    userAuth: userAuthReducer,
    dashboard: dashboardReducer,
    courses: courseReducer,
    books: booksReducer,
    Narrativess: NarrativesReducer,
    poem: poemReducer
  },
});

export default store;