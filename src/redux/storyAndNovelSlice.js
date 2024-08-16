import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, update, remove } from 'firebase/database';
import { db } from '../Config/firebase';

export const fetchStoryAndNovels = createAsyncThunk(
  'storyAndNovels/fetchStoryAndNovels',
  async (_, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'storyAndNovelData');
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

export const addStoryAndNovels = createAsyncThunk(
  'storyAndNovels/addStoryAndNovels',
  async (itemData, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'storyAndNovelData');
      const newItemRef = push(itemsRef);
      await set(newItemRef, itemData); // Use `set` instead of `update` for new items
      return { id: newItemRef.key, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateStoryAndNovels = createAsyncThunk(
  'storyAndNovels/updateStoryAndNovels',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `storyAndNovelData/${id}`);
      await update(itemRef, itemData);
      return { id, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteStoryAndNovels = createAsyncThunk(
  'storyAndNovels/deleteStoryAndNovels',
  async (id, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `storyAndNovelData/${id}`);
      await remove(itemRef);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const storyAndNovelSlice = createSlice({
  name: 'storyAndNovels',
  initialState: {
    storyAndNovelData: [],
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
      .addCase(fetchStoryAndNovels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoryAndNovels.fulfilled, (state, action) => {
        state.loading = false;
        state.storyAndNovelData = action.payload;
      })
      .addCase(fetchStoryAndNovels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addStoryAndNovels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStoryAndNovels.fulfilled, (state, action) => {
        state.loading = false;
        state.storyAndNovelData.push(action.payload);
      })
      .addCase(addStoryAndNovels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStoryAndNovels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStoryAndNovels.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.storyAndNovelData.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.storyAndNovelData[index] = action.payload;
        }
      })
      .addCase(updateStoryAndNovels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteStoryAndNovels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStoryAndNovels.fulfilled, (state, action) => {
        state.loading = false;
        state.storyAndNovelData = state.storyAndNovelData.filter(item => item.id !== action.payload);
      })
      .addCase(deleteStoryAndNovels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = storyAndNovelSlice.actions;
export default storyAndNovelSlice.reducer;
