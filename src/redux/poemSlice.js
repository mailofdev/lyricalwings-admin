import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../Config/firebase';

export const fetchPoemCounts = createAsyncThunk(
  'poems/fetchPoemCounts',
  async (_, { rejectWithValue }) => {
    try {
      const poemsRef = ref(db, 'PoemData');
      const snapshot = await get(poemsRef);
      
      if (snapshot.exists()) {
        const poemsData = snapshot.val();
        const totalPoems = Object.keys(poemsData).length;
        const totalHappiness = Object.values(poemsData).filter(poem => poem.type === 'happiness').length;
        const totalSadness = Object.values(poemsData).filter(poem => poem.type === 'sadness').length;
        const totalAnger = Object.values(poemsData).filter(poem => poem.type === 'anger').length;
        const totalFear = Object.values(poemsData).filter(poem => poem.type === 'fear').length;
        const totalDisgust = Object.values(poemsData).filter(poem => poem.type === 'disgust').length;
        const totalSurprise = Object.values(poemsData).filter(poem => poem.type === 'surprise').length;
        
        return { totalPoems, totalHappiness, totalSadness, totalAnger, totalFear, totalDisgust, totalSurprise };
      }
      
      return { totalPoems: 0, totalHappiness: 0, totalSadness: 0, totalAnger: 0, totalFear: 0, totalDisgust: 0, totalSurprise: 0 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPoems = createAsyncThunk(
  'poems/fetchPoems',
  async ({ page, pageSize, filterType }, { rejectWithValue }) => {
    try {
      const poemsRef = ref(db, 'PoemData');
      let queryRef;

      if (filterType && filterType !== 'all') {
        queryRef = query(poemsRef, orderByChild('type'), equalTo(filterType));
      } else {
        queryRef = poemsRef;
      }

      const snapshot = await get(queryRef);
      if (snapshot.exists()) {
        let poemsArray = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
        let reversedPoems = poemsArray.slice().reverse();

        const totalPoems = reversedPoems.length;
        const paginatedPoems = reversedPoems.slice((page - 1) * pageSize, page * pageSize);

        return { poems: paginatedPoems, totalPoems };
      }
      return { poems: [], totalPoems: 0 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPoem = createAsyncThunk(
  'poems/addPoem',
  async (newPoem, { rejectWithValue }) => {
    try {
      const poemsRef = ref(db, 'PoemData');
      const newPoemRef = push(poemsRef);
      await set(newPoemRef, newPoem);
      return { id: newPoemRef.key, ...newPoem };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePoem = createAsyncThunk(
  'poems/updatePoem',
  async ({ poemId, updatedPoem }, { rejectWithValue }) => {
    try {
      const poemRef = ref(db, `PoemData/${poemId}`);
      await update(poemRef, updatedPoem);
      return { id: poemId, ...updatedPoem };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePoem = createAsyncThunk(
  'poems/deletePoem',
  async (poemId, { rejectWithValue }) => {
    try {
      const poemRef = ref(db, `PoemData/${poemId}`);
      await remove(poemRef);
      return poemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAllPoems = createAsyncThunk(
  'poems/deleteAllPoems',
  async (_, { rejectWithValue }) => {
    try {
      const poemsRef = ref(db, 'PoemData');
      await remove(poemsRef);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const poemsSlice = createSlice({
  name: 'poems',
  initialState: {
    poemsList: [],
    totalPoems: 0, 
    totalHappiness: 0, 
    totalSadness: 0, 
    totalAnger: 0, 
    totalFear: 0, 
    totalDisgust: 0, 
    totalSurprise: 0 ,
    isLoading: false,
    loadingMessage: '',
    error: null,
  },
  reducers: {
    clearErrorMessage: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPoemCounts.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Loading poems...";
        state.error = null;
      })
      .addCase(fetchPoemCounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.totalPoems = action.payload.totalPoems;
        state.totalAnger = action.payload.totalAnger;
        state.totalDisgust = action.payload.totalDisgust;
        state.totalFear = action.payload.totalFear;
        state.totalHappiness = action.payload.totalHappiness;
        state.totalSadness = action.payload.totalSadness;
        state.totalSurprise = action.payload.totalSurprise;
      })
      .addCase(fetchPoemCounts.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(fetchPoems.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Loading poems...";
        state.error = null;
      })
      .addCase(fetchPoems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.poemsList = action.payload.poems;
        state.totalPoems = action.payload.totalPoems;
      })
      .addCase(fetchPoems.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(addPoem.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Adding new poem...";
        state.error = null;
      })
      .addCase(addPoem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.poemsList.push(action.payload);
      })
      .addCase(addPoem.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(updatePoem.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Updating poem...";
        state.error = null;
      })
      .addCase(updatePoem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        const index = state.poemsList.findIndex(poem => poem.id === action.payload.id);
        if (index !== -1) {
          state.poemsList[index] = action.payload;
        }
      })
      .addCase(updatePoem.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(deletePoem.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Deleting poem...";
        state.error = null;
      })
      .addCase(deletePoem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.poemsList = state.poemsList.filter(poem => poem.id !== action.payload);
      })
      .addCase(deletePoem.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(deleteAllPoems.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Deleting all poems...";
        state.error = null;
      })
      .addCase(deleteAllPoems.fulfilled, (state) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.poemsList = [];
        state.totalPoems = 0;
      })
      .addCase(deleteAllPoems.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      });
  },
});

export const { clearError } = poemsSlice.actions;
export default poemsSlice.reducer;
