import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../Config/firebase';

// Helper function to upload a file and get its URL
const uploadFile = async (file, path) => {
  if (!file) return null;
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

// Helper function to delete a file
const deleteFile = async (url) => {
  if (!url) return;
  const fileRef = storageRef(storage, url);
  await deleteObject(fileRef);
};

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'CourseData');
      const snapshot = await get(itemsRef);
      if (snapshot.exists() && snapshot.val()) {
        return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCourses = createAsyncThunk(
  'courses/addCourses',
  async ({ itemData, fileFields }, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'CourseData');
      const newItemRef = push(itemsRef);
      const id = newItemRef.key;

      // Upload files and get URLs
      for (const field of fileFields) {
        if (itemData[field]) {
          // Check if it's a blob URL
          if (itemData[field].startsWith('blob:')) {
            const response = await fetch(itemData[field]);
            const blob = await response.blob();
            itemData[field] = await uploadFile(blob, `CourseData/${id}_${field}`);
          } else if (itemData[field] instanceof File) {
            itemData[field] = await uploadFile(itemData[field], `CourseData/${id}_${field}`);
          }
        }
      }

      await update(newItemRef, itemData);
      return { id, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCourses = createAsyncThunk(
  'courses/updateCourses',
  async ({ id, itemData, fileFields }, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `CourseData/${id}`);
      const snapshot = await get(itemRef);
      const currentItem = snapshot.val();

      // Handle file updates
      for (const field of fileFields) {
        if (itemData[field]) {
          if (itemData[field].startsWith('blob:')) {
            // New file uploaded
            if (currentItem[field]) {
              await deleteFile(currentItem[field]);
            }
            const response = await fetch(itemData[field]);
            const blob = await response.blob();
            itemData[field] = await uploadFile(blob, `CourseData/${id}_${field}`);
          } else if (itemData[field] instanceof File) {
            // New file uploaded
            if (currentItem[field]) {
              await deleteFile(currentItem[field]);
            }
            itemData[field] = await uploadFile(itemData[field], `CourseData/${id}_${field}`);
          }
        } else if (itemData[field] === null) {
          // File removed
          if (currentItem[field]) {
            await deleteFile(currentItem[field]);
          }
          delete itemData[field];
        } else {
          // No change, keep existing URL
          itemData[field] = currentItem[field];
        }
      }

      await update(itemRef, itemData);
      return { id, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCourses = createAsyncThunk(
  'courses/deleteCourses',
  async ({ id, fileFields }, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `CourseData/${id}`);
      const snapshot = await get(itemRef);
      const currentItem = snapshot.val();

      // Delete all associated files
      for (const field of fileFields) {
        if (currentItem[field]) {
          await deleteFile(currentItem[field]);
        }
      }

      await remove(itemRef);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    CourseData: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.CourseData = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.CourseData.push(action.payload);
      })
      .addCase(addCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.CourseData = state.CourseData.map(item => item.id === action.payload.id ? action.payload : item);
      })
      .addCase(updateCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.CourseData = state.CourseData.filter(item => item.id !== action.payload);
      })
      .addCase(deleteCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = courseSlice.actions;
export default courseSlice.reducer;