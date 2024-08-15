import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../Config/firebase';


export const fetchItems = createAsyncThunk(
  'books/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'BookData');
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
  'books/addItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'BookData');
      const newItemRef = push(itemsRef);
      
      if (itemData.bookFile) {
        const fileRef = storageRef(storage, `bookData/${newItemRef.key}_${itemData.bookFile.name}`);
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
  'books/updateItem',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `BookData/${id}`);
      const snapshot = await get(itemRef);
      const currentItem = snapshot.val();

      if (itemData.bookFile) {
        if (currentItem.bookFileUrl) {
          // await deleteObject(refFromURL(currentItem.bookFileUrl));
          await deleteObject(storage.refFromURL(currentItem.bookFileUrl));
        }

        const fileRef = storageRef(storage, `bookData/${id}_${itemData.bookFile.name}`);
        await uploadBytes(fileRef, itemData.bookFile);
        const downloadURL = await getDownloadURL(fileRef);
        itemData.bookFileUrl = downloadURL;
        delete itemData.bookFile;
      } else if (itemData.bookFileUrl === null) {
        if (currentItem.bookFileUrl) {
          await deleteObject(storage.refFromURL(currentItem.bookFileUrl));
        }
        delete itemData.bookFileUrl;
      } else {
        itemData.bookFileUrl = currentItem.bookFileUrl;
      }

      await update(itemRef, itemData);
      return { id, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'books/deleteItem',
  async (id, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `BookData/${id}`);
      const snapshot = await get(itemRef);
      const currentItem = snapshot.val();

      if (currentItem && currentItem.bookFileUrl) {
        await deleteObject(storage.refFromURL(currentItem.bookFileUrl));
      }
      await remove(itemRef);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const booksSlice = createSlice({
  name: 'books',
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

export const { clearError } = booksSlice.actions;
export default booksSlice.reducer;
