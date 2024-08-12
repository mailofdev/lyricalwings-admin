import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, set, get, remove, update } from 'firebase/database';
import { db, storage } from '../Config/firebase';
import { ref as storageRef, deleteObject, getDownloadURL, uploadBytes } from 'firebase/storage';

// export const addCourse = createAsyncThunk('courses/addCourse', async ({ title, fileURL }) => {
//   const courseRef = ref(db, `courses/${title}`);
//   await set(courseRef, { title, fileURL });
//   return { title, fileURL };
// });
export const addCourse = createAsyncThunk('courses/addCourse', async (courseData, { rejectWithValue }) => {
    try {
      const courseRef = ref(db, 'courses');
      await set(courseRef, courseData);
      return { id: courseRef.id, ...courseData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourses = createAsyncThunk('courses/fetchCourses', async () => {
  const coursesRef = ref(db, 'courses');
  const snapshot = await get(coursesRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return {};
  }
});



export const deleteCourse = createAsyncThunk('courses/deleteCourse', async (title) => {
  const courseRef = ref(db, `courses/${title}`);
  const snapshot = await get(courseRef);
  if (snapshot.exists()) {
    const course = snapshot.val();
    if (course.fileURL) {
      const fileRef = storageRef(storage, course.fileURL);
      await deleteObject(fileRef);
    }
  }
  await remove(courseRef);
  return title;
});

export const updateCourse = createAsyncThunk('courses/updateCourse', async ({ oldTitle, newTitle, file }) => {
  const oldCourseRef = ref(db, `courses/${oldTitle}`);
  const newCourseRef = ref(db, `courses/${newTitle}`);

  // Get the old course data
  const snapshot = await get(oldCourseRef);
  if (!snapshot.exists()) {
    throw new Error('Course not found');
  }
  const oldCourse = snapshot.val();

  let fileURL = oldCourse.fileURL;

  // If a new file is provided, upload it and delete the old one
  if (file) {
    if (oldCourse.fileURL) {
      const oldFileRef = storageRef(storage, oldCourse.fileURL);
      await deleteObject(oldFileRef);
    }
    const newFileRef = storageRef(storage, `courses/${file.name}`);
    await uploadBytes(newFileRef, file);
    fileURL = await getDownloadURL(newFileRef);
  }

  // Update the course in the database
  if (oldTitle !== newTitle) {
    await remove(oldCourseRef);
  }
  await set(newCourseRef, { title: newTitle, fileURL });

  return { oldTitle, newTitle, fileURL };
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addCourse.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.courses[action.payload.title] = action.payload;
      })
      .addCase(addCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteCourse.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        delete state.courses[action.payload];
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateCourse.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { oldTitle, newTitle, fileURL } = action.payload;
        delete state.courses[oldTitle];
        state.courses[newTitle] = { title: newTitle, fileURL };
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default courseSlice.reducer;