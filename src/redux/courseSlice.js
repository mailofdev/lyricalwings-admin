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

export const fetchItems = createAsyncThunk(
  'courses/fetchItems',
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

export const addItem = createAsyncThunk(
  'courses/addItem',
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

export const updateItem = createAsyncThunk(
  'courses/updateItem',
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

export const deleteItem = createAsyncThunk(
  'courses/deleteItem',
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
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.CourseData = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false;
        state.CourseData.push(action.payload);
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false;
        state.CourseData = state.CourseData.map(item => item.id === action.payload.id ? action.payload : item);
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.CourseData = state.CourseData.filter(item => item.id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = courseSlice.actions;
export default courseSlice.reducer;