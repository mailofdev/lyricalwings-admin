import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../Config/firebase';

export const fetchItems = createAsyncThunk(
  'about/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'BookData');
      const snapshot = await get(itemsRef);
      if (snapshot.exists()) {
        return Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItem = createAsyncThunk(
  'about/addItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'BookData');
      const newItemRef = push(itemsRef);
      
      if (itemData.bookFile) {
        const fileRef = storageRef(storage, `covers/${newItemRef.key}_${itemData.bookFile.name}`);
        await uploadBytes(fileRef, itemData.bookFile);
        const downloadURL = await getDownloadURL(fileRef);
        itemData.bookFileUrl = downloadURL;
        delete itemData.bookFile;
      }

      await update(newItemRef, itemData);
      return { id: newItemRef.key, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const updateItem = createAsyncThunk(
  'about/updateItem',
  async ({ id, itemData }, { rejectWithValue, getState }) => {
    try {
      const itemRef = ref(db, `BookData/${id}`);

      // Get the current item data
      const snapshot = await get(itemRef);
      const currentItem = snapshot.val();

      if (itemData.bookFile) {
        // Delete the existing file if it exists
        if (currentItem.bookFileUrl) {
          const oldFileRef = storageRef(storage, currentItem.bookFileUrl);
          await deleteObject(oldFileRef);
        }

        // Upload the new file
        const fileRef = storageRef(storage, `covers/${id}_${itemData.bookFile.name}`);
        await uploadBytes(fileRef, itemData.bookFile);
        const downloadURL = await getDownloadURL(fileRef);
        itemData.bookFileUrl = downloadURL;
        delete itemData.bookFile;
      } else if (itemData.bookFileUrl === null) {
        // If bookFileUrl is explicitly set to null, delete the existing file
        if (currentItem.bookFileUrl) {
          const oldFileRef = storageRef(storage, currentItem.bookFileUrl);
          await deleteObject(oldFileRef);
        }
        // Remove the bookFileUrl from the itemData
        delete itemData.bookFileUrl;
      } else {
        // If no new file is provided and bookFileUrl is not null, keep the existing bookFileUrl
        itemData.bookFileUrl = currentItem.bookFileUrl;
      }

      // Update the item in the database
      await update(itemRef, itemData);
      return { id, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'about/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `BookData/${id}`);
      await remove(itemRef);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const aboutSlice = createSlice({
  name: 'about',
  initialState: {
    BookData: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.BookData = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false;
        state.BookData.push(action.payload);
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.BookData.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.BookData[index] = action.payload;
        }
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.BookData = state.BookData.filter(item => item.id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = aboutSlice.actions;
export default aboutSlice.reducer;