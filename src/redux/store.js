import { configureStore } from '@reduxjs/toolkit';
import aboutReducer from '../redux/aboutSlice';
import contentReducer from '../redux/contentSlice';
import userAuthReducer from '../redux/userAuthSlice';
import dashboardReducer from '../redux/dashboardSlice';
import courseReducer from '../redux/courseSlice';
import booksReducer from '../redux/booksSlice';
import storyAndNovelReducer from '../redux/storyAndNovelSlice';

const store = configureStore({
  reducer: {
    about: aboutReducer,
    content: contentReducer,
    userAuth: userAuthReducer,
    dashboard: dashboardReducer,
    courses: courseReducer,
    books: booksReducer,
    storyAndNovels: storyAndNovelReducer
  },
});

export default store;
