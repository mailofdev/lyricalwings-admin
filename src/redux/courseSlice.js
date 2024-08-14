import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { ref, set, get, remove } from 'firebase/database';
import { db, storage } from '../Config/firebase';
import { ref as storageRef, deleteObject, getDownloadURL, uploadBytes } from 'firebase/storage';

const sanitizeTitle = (title) => {
  if (typeof title !== 'string' || !title.trim()) {
    throw new Error('Title is required and must be a non-empty string');
  }
  return title.trim().replace(/[.#$[\]]/g, '_');
};

const handleFileOperation = async (file, path) => {
  if (file) {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  }
  return null;
};

const deleteFileIfExists = async (fileURL) => {
  if (fileURL) {
    const fileRef = storageRef(storage, fileURL);
    try {
      await deleteObject(fileRef);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
};

export const addItem = createAsyncThunk(
  'courses/addItem',
  async ({ type, ...rest }, { rejectWithValue }) => {
    try {
      const titleField = type === 'intro' ? 'introTitle' : 'titleOfPoem';
      const title = sanitizeTitle(rest[titleField]);

      const itemRef = ref(db, `courses/${type}/${title}`);
      const fileFields = ['introFileURL', 'structureFileURL', 'literatureFileURL', 'methodologyFileURL', 'evalutionFileURL', 'conclusionFileURL'];
      
      for (let field of fileFields) {
        if (rest[field] && rest[field].file) {
          rest[field] = await handleFileOperation(rest[field].file, `courses/${type}/${title}/${field}/${rest[field].name}`);
        }
      }

      await set(itemRef, { [titleField]: title, ...rest });
      return { type, [titleField]: title, ...rest };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchItems = createAsyncThunk(
  'courses/fetchItems',
  async (type, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, `courses/${type}`);
      const snapshot = await get(itemsRef);
      return { type, items: snapshot.exists() ? snapshot.val() : {} };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteItem = createAsyncThunk(
  'courses/deleteItem',
  async ({ type, title }, { rejectWithValue }) => {
    try {
      const sanitizedTitle = sanitizeTitle(title);
      const itemRef = ref(db, `courses/${type}/${sanitizedTitle}`);
      const snapshot = await get(itemRef);
      if (snapshot.exists()) {
        const item = snapshot.val();
        const fileFields = ['introFileURL', 'structureFileURL', 'literatureFileURL', 'methodologyFileURL', 'evalutionFileURL', 'conclusionFileURL'];
        for (let field of fileFields) {
          await deleteFileIfExists(item[field]);
        }
      }
      await remove(itemRef);
      return { type, title: sanitizedTitle };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItem = createAsyncThunk(
  'courses/updateItem',
  async ({ type, oldTitle, newTitle, ...rest }, { rejectWithValue }) => {
    try {
      const titleField = type === 'intro' ? 'introTitle' : 'titleOfPoem';
      const sanitizedOldTitle = sanitizeTitle(oldTitle);
      const sanitizedNewTitle = sanitizeTitle(newTitle);

      const oldItemRef = ref(db, `courses/${type}/${sanitizedOldTitle}`);
      const newItemRef = ref(db, `courses/${type}/${sanitizedNewTitle}`);

      const snapshot = await get(oldItemRef);
      if (!snapshot.exists()) {
        return rejectWithValue('Item not found');
      }
      const oldItem = snapshot.val();

      const fileFields = ['introFileURL', 'structureFileURL', 'literatureFileURL', 'methodologyFileURL', 'evaluationFileURL', 'conclusionFileURL'];
      const updatedItem = { ...oldItem, ...rest };

      for (let field of fileFields) {
        if (rest[field] && rest[field].file) {
          await deleteFileIfExists(oldItem[field]);
          updatedItem[field] = await handleFileOperation(rest[field].file, `courses/${type}/${sanitizedNewTitle}/${field}/${rest[field].name}`);
        } else if (rest[field] === null) {
          // If the field is explicitly set to null, remove it
          delete updatedItem[field];
        }
        // If the field is not in rest, keep the old value
      }

      if (sanitizedOldTitle !== sanitizedNewTitle) {
        await remove(oldItemRef);
      }
      await set(newItemRef, { [titleField]: sanitizedNewTitle, ...updatedItem });

      return { type, oldTitle: sanitizedOldTitle, newTitle: sanitizedNewTitle, [titleField]: sanitizedNewTitle, ...updatedItem };
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred while updating the item');
    }
  }
);

export const clearError = createAction('courses/clearError');

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    intro: {},
    types: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state[action.payload.type] = action.payload.items;
      })
      .addCase(addItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { type, ...rest } = action.payload;
        const titleField = type === 'intro' ? 'introTitle' : 'titleOfPoem';
        state[type][rest[titleField]] = rest;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'An unknown error occurred';
      })
      .addCase(updateItem.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const { type, oldTitle, newTitle, ...rest } = action.payload;
        const titleField = type === 'intro' ? 'introTitle' : 'titleOfPoem';
        state.status = 'succeeded';
        if (oldTitle !== newTitle) {
          delete state[type][oldTitle];
        }
        state[type][newTitle] = { [titleField]: newTitle, ...rest };
      })
      .addCase(updateItem.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'An unknown error occurred';
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { type, title } = action.payload;
        delete state[type][title];
      })
      .addCase(clearError, (state) => {
        state.error = null;
        state.status = 'idle';
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.error.message || 'An unknown error occurred';
        }
      );
  },
});

export default courseSlice.reducer;