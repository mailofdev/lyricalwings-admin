import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../Config/firebase';

export const fetchStoryAndNovelsCounts = createAsyncThunk(
  'storyAndNovels/fetchStoryAndNovelsCounts',
  async (_, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'storyAndNovelData');
      const snapshot = await get(itemsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const totalCount = Object.keys(data).length;
        const storyCount = Object.values(data).filter(item => item.type === 'story').length;
        const novelCount = Object.values(data).filter(item => item.type === 'novel').length;
        
        return { totalCount, storyCount, novelCount };
      }
      
      return { totalCount: 0, storyCount: 0, novelCount: 0 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStoryAndNovels = createAsyncThunk(
  'storyAndNovels/fetchStoryAndNovels',
  async ({ page, pageSize, type }, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'storyAndNovelData');
      let dbQuery;

      if (type && type !== 'showAllStoryAndNovel') {
        dbQuery = query(
          itemsRef,
          orderByChild('type'),
          equalTo(type)
        );
      } else {
        dbQuery = itemsRef;
      }

      const snapshot = await get(dbQuery);
      if (snapshot.exists()) {
        let data = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
        let reverseData = data.slice().reverse();

        const totalCount = reverseData.length;
        const paginatedData = reverseData.slice((page - 1) * pageSize, page * pageSize);

        return { reverseData: paginatedData, totalCount };
      }
      return { reverseData: [], totalCount: 0 };
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
    totalCount: 0,
    storyCount: 0,
    novelCount: 0,
    loading: false,
    loadingMessage: '',  // Add a field to hold the loading message
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchStoryAndNovelsCounts.pending, (state) => {
      state.loading = true;
      state.loadingMessage = "Fetching story and novel counts...";
      state.error = null;
    })
    .addCase(fetchStoryAndNovelsCounts.fulfilled, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.totalCount = action.payload.totalCount;
      state.storyCount = action.payload.storyCount;
      state.novelCount = action.payload.novelCount;
    })
    .addCase(fetchStoryAndNovelsCounts.rejected, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.error = action.payload;
    })
    .addCase(fetchStoryAndNovels.pending, (state) => {
      state.loading = true;
      state.loadingMessage = "Loading stories and novels...";
      state.error = null;
    })
    .addCase(fetchStoryAndNovels.fulfilled, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.storyAndNovelData = action.payload.reverseData;
      state.totalCount = action.payload.totalCount;
    })
    .addCase(fetchStoryAndNovels.rejected, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.error = action.payload;
    })
    .addCase(addStoryAndNovels.pending, (state) => {
      state.loading = true;
      state.loadingMessage = "Adding your story or novel...";
      state.error = null;
    })
    .addCase(addStoryAndNovels.fulfilled, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.storyAndNovelData.push(action.payload);
    })
    .addCase(addStoryAndNovels.rejected, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.error = action.payload;
    })
    .addCase(updateStoryAndNovels.pending, (state) => {
      state.loading = true;
      state.loadingMessage = "Updating the story or novel...";
      state.error = null;
    })
    .addCase(updateStoryAndNovels.fulfilled, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      const index = state.storyAndNovelData.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.storyAndNovelData[index] = action.payload;
      }
    })
    .addCase(updateStoryAndNovels.rejected, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.error = action.payload;
    })
    .addCase(deleteStoryAndNovels.pending, (state) => {
      state.loading = true;
      state.loadingMessage = "Deleting the story or novel...";
      state.error = null;
    })
    .addCase(deleteStoryAndNovels.fulfilled, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.storyAndNovelData = state.storyAndNovelData.filter(item => item.id !== action.payload);
    })
    .addCase(deleteStoryAndNovels.rejected, (state, action) => {
      state.loading = false;
      state.loadingMessage = '';
      state.error = action.payload;
    });
  },
});


export const { clearError } = storyAndNovelSlice.actions;
export default storyAndNovelSlice.reducer;
