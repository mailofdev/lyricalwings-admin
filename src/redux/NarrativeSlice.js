import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../Config/firebase';

export const fetchNarrativeCounts = createAsyncThunk(
  'Narrative/fetchNarrativeCounts',
  async (_, { rejectWithValue }) => {
    try {
      const NarrativeRef = ref(db, 'NarrativeData');
      const snapshot = await get(NarrativeRef);
      
      if (snapshot.exists()) {
        const NarrativeData = snapshot.val();
        const totalNarrative = Object.keys(NarrativeData).length;
        const totalStory = Object.values(NarrativeData).filter(Narrative => Narrative.type === 'story').length;
        const totalNovel = Object.values(NarrativeData).filter(Narrative => Narrative.type === 'novel').length;
        
        return { totalNarrative, totalStory, totalNovel, };
      }
      
      return { totalNarrative: 0, totalStory: 0, totalNovel: 0,  };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNarrative = createAsyncThunk(
    'Narrative/fetchNarrative',
    async ({ page, pageSize, filterType, searchQuery }, { rejectWithValue }) => {
      try {
        const NarrativeRef = ref(db, 'NarrativeData');
        let queryRef;
  
        if (filterType && filterType !== 'all') {
          queryRef = query(NarrativeRef, orderByChild('type'), equalTo(filterType));
        } else {
          queryRef = NarrativeRef;
        }
  
        const snapshot = await get(queryRef);
        if (snapshot.exists()) {
          let NarrativeArray = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
          let reversedNarrative = NarrativeArray.slice().reverse();
  
          // Apply search filter if searchQuery is provided
          if (searchQuery) {
            reversedNarrative = reversedNarrative.filter(Narrative =>
              Narrative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              Narrative.htmlContent.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
  
          const totalNarrative = reversedNarrative.length;
          const paginatedNarrative = reversedNarrative.slice((page - 1) * pageSize, page * pageSize);
  
          return { Narrative: paginatedNarrative, totalNarrative };
        }
        return { Narrative: [], totalNarrative: 0 };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

export const addNarrative = createAsyncThunk(
  'Narrative/addNarrative',
  async (newNarrative, { rejectWithValue }) => {
    try {
      const NarrativeRef = ref(db, 'NarrativeData');
      const newNarrativeRef = push(NarrativeRef);
      await set(newNarrativeRef, newNarrative);
      return { id: newNarrativeRef.key, ...newNarrative };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateNarrative = createAsyncThunk(
  'Narrative/updateNarrative',
  async ({ NarrativeId, updatedNarrative }, { rejectWithValue }) => {
    try {
      const NarrativeRef = ref(db, `NarrativeData/${NarrativeId}`);
      await update(NarrativeRef, updatedNarrative);
      return { id: NarrativeId, ...updatedNarrative };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNarrative = createAsyncThunk(
  'Narrative/deleteNarrative',
  async (NarrativeId, { rejectWithValue }) => {
    try {
      const NarrativeRef = ref(db, `NarrativeData/${NarrativeId}`);
      await remove(NarrativeRef);
      return NarrativeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAllNarrative = createAsyncThunk(
  'Narrative/deleteAllNarrative',
  async (_, { rejectWithValue }) => {
    try {
      const NarrativeRef = ref(db, 'NarrativeData');
      await remove(NarrativeRef);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const NarrativeSlice = createSlice({
    name: 'Narrative',
    initialState: {
      NarrativeList: [],
      totalNarrative: 0, 
      totalStory: 0, 
      totalNovel: 0, 
      isLoading: false,
      loadingMessage: '',
      error: null,
    },
    reducers: {
      clearError: (state) => {
        state.error = null;
      },
      setNarrativeList: (state, action) => {
        state.NarrativeList = action.payload;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchNarrativeCounts.pending, (state) => {
          state.isLoading = true;
          state.loadingMessage = "Loading Narrative...";
          state.error = null;
        })
        .addCase(fetchNarrativeCounts.fulfilled, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          Object.assign(state, action.payload);
        })
        .addCase(fetchNarrativeCounts.rejected, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.error = action.payload;
        })
      .addCase(fetchNarrative.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Loading Narrative...";
        state.error = null;
      })
      .addCase(fetchNarrative.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.NarrativeList = action.payload.Narrative;
        state.totalNarrative = action.payload.totalNarrative;
      })
      .addCase(fetchNarrative.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(addNarrative.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Adding new Narrative...";
        state.error = null;
      })
      .addCase(addNarrative.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.NarrativeList.push(action.payload);
      })
      .addCase(addNarrative.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(updateNarrative.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Updating Narrative...";
        state.error = null;
      })
      .addCase(updateNarrative.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        const index = state.NarrativeList.findIndex(Narrative => Narrative.id === action.payload.id);
        if (index !== -1) {
          state.NarrativeList[index] = action.payload;
        }
      })
      .addCase(updateNarrative.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(deleteNarrative.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Deleting Narrative...";
        state.error = null;
      })
      .addCase(deleteNarrative.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.NarrativeList = state.NarrativeList.filter(Narrative => Narrative.id !== action.payload);
      })
      .addCase(deleteNarrative.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(deleteAllNarrative.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Deleting all Narrative...";
        state.error = null;
      })
      .addCase(deleteAllNarrative.fulfilled, (state) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.NarrativeList = [];
        state.totalNarrative = 0;
      })
      .addCase(deleteAllNarrative.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      });
  },
});

export const { clearError } = NarrativeSlice.actions;
export default NarrativeSlice.reducer;
