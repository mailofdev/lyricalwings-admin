// store.js
import { configureStore } from '@reduxjs/toolkit';
import aboutReducer from './aboutSlice';
import userAuthReducer from './userAuthSlice';
import dashboardReducer from './dashboardSlice';
import courseReducer from './courseSlice';
import booksReducer from './booksSlice';
import poemReducer from './poemSlice';
import NarrativeReducer from './NarrativeSlice'

const store = configureStore({
  reducer: {
    about: aboutReducer,
    userAuth: userAuthReducer,
    dashboard: dashboardReducer,
    courses: courseReducer,
    books: booksReducer,
    poem: poemReducer,
    Narrative: NarrativeReducer
  },
});

export default store;