import { configureStore } from '@reduxjs/toolkit';
import aboutReducer from './aboutSlice';
import contentReducer from './contentSlice';
import userAuthReducer from './userAuthSlice';
import dashboardReducer from './dashboardSlice';
import courseReducer from './courseSlice';
import booksReducer from './booksSlice';
import storyAndNovelReducer from './storyAndNovelSlice';
import poemReducer from './poemSlice';

const store = configureStore({
  reducer: {
    about: aboutReducer,
    content: contentReducer,
    userAuth: userAuthReducer,
    dashboard: dashboardReducer,
    courses: courseReducer,
    books: booksReducer,
    storyAndNovels: storyAndNovelReducer,
    poem: poemReducer
  },
});

export default store;
