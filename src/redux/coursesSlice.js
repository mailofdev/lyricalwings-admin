import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../common/firebase';

const uploadFile = async (file, folder) => {
  if (!(file instanceof File)) return file; // If it's already a URL, return it
  const filename = `${Date.now()}_${file.name}`;
  const fileRef = storageRef(storage, `${folder}/${filename}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

export const fetchcourses = createAsyncThunk('courses/fetchcourses', async () => {
  const coursesRef = ref(db, 'courses');
  const snapshot = await get(coursesRef);
  const courses = snapshot.val() || {};
  return Object.keys(courses).map(key => ({ id: key, ...courses[key] }));
});

export const addcourses = createAsyncThunk('courses/addcourses', async (coursesData) => {
  let updatedcoursesData = { ...coursesData };

  const fileFields = ['structureFileURL', 'literatureFileURL', 'methodologyFileURL', 'evalutionFileURL', 'conclusionFileURL'];
  for (const field of fileFields) {
    if (updatedcoursesData[field] instanceof File) {
      updatedcoursesData[field] = await uploadFile(updatedcoursesData[field], 'courses_files');
    }
  }

  const coursesRef = ref(db, 'courses');
  const newcoursesRef = push(coursesRef);
  await set(newcoursesRef, updatedcoursesData);
  return { id: newcoursesRef.key, ...updatedcoursesData };
});

export const updatecourses = createAsyncThunk('courses/updatecourses', async ({ id, coursesData }) => {
  let updatedcoursesData = { ...coursesData };

  const fileFields = ['structureFileURL', 'literatureFileURL', 'methodologyFileURL', 'evalutionFileURL', 'conclusionFileURL'];
  for (const field of fileFields) {
    if (updatedcoursesData[field] instanceof File) {
      updatedcoursesData[field] = await uploadFile(updatedcoursesData[field], 'courses_files');
    }
  }

  const coursesRef = ref(db, `courses/${id}`);
  await set(coursesRef, updatedcoursesData);
  return { id, ...updatedcoursesData };
});

export const deletecourses = createAsyncThunk('courses/deletecourses', async (id) => {
  const coursesRef = ref(db, `courses/${id}`);
  await remove(coursesRef);
  return id;
});

export const addLike = createAsyncThunk('courses/addLike', async ({ coursesId, userName }) => {
  const likeRef = ref(db, `courses/${coursesId}/likes/${userName}`);
  await set(likeRef, true);
  return { coursesId, userName };
});

export const removeLike = createAsyncThunk('courses/removeLike', async ({ coursesId, userName }) => {
  const likeRef = ref(db, `courses/${coursesId}/likes/${userName}`);
  await remove(likeRef);
  return { coursesId, userName };
});

export const addComment = createAsyncThunk('courses/addComment', async ({ coursesId, userName, comment }) => {
  const commentsRef = ref(db, `courses/${coursesId}/comments`);
  const newCommentRef = push(commentsRef);
  const commentData = {
    userName,
    text: comment,
    timestamp: Date.now()
  };
  await set(newCommentRef, commentData);
  return { coursesId, commentId: newCommentRef.key, ...commentData };
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchcourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchcourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchcourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addcourses.fulfilled, (state, action) => {
        state.courses.push(action.payload);
        state.saveUpdateLoading = false;
        const { coursesId, userName } = action.payload;
        const course = state.courses.find(p => p.id === coursesId);
        if (course) {
          if (!course.likes) course.likes = {};
          course.likes[userName] = true;
        }
      })
      .addCase(updatecourses.fulfilled, (state, action) => {
        const index = state.courses.findIndex(course => course.id === action.payload.id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
      })
      .addCase(deletecourses.fulfilled, (state, action) => {
        state.courses = state.courses.filter(course => course.id !== action.payload);
      })
      .addCase(addcourses.pending, (state) => {
        state.saveUpdateLoading = true;
      })
      .addCase(addcourses.rejected, (state, action) => {
        state.saveUpdateLoading = false;
      })
      .addCase(removeLike.fulfilled, (state, action) => {
        const { coursesId, userName } = action.payload;
        const course = state.courses.find(p => p.id === coursesId);
        if (course && course.likes) {
          delete course.likes[userName];
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { coursesId, commentId, ...commentData } = action.payload;
        const course = state.courses.find(p => p.id === coursesId);
        if (course) {
          if (!course.comments) course.comments = {};
          course.comments[commentId] = commentData;
        }
      });
  },
});

export default coursesSlice.reducer;