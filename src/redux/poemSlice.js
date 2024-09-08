import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, update, remove, query, orderByChild, limitToLast, equalTo } from 'firebase/database';
import { db } from '../Config/firebase';

// Helper function to store the latest 3 poems by type
const trimToLatestThreePoems = async (type) => {
  try {
    const latestPoemsRef = ref(db, 'LatestPoems');
    const typeQuery = query(latestPoemsRef, orderByChild('type'), equalTo(type));
    const snapshot = await get(typeQuery);

    if (snapshot.exists()) {
      const poemsArray = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
      const totalPoemsOfType = poemsArray.length;

      // If there are more than 3 poems of the same type, delete the oldest ones
      if (totalPoemsOfType > 3) {
        const poemsToRemove = poemsArray
          .sort((a, b) => a.timestamp - b.timestamp) // Sort by timestamp (oldest first)
          .slice(0, totalPoemsOfType - 3); // Oldest poems to remove

        for (const poem of poemsToRemove) {
          await remove(ref(db, `LatestPoems/${poem.id}`));
        }
      }
    }
  } catch (error) {
    console.error('Error trimming poems:', error);
  }
};

// Fetch Poem Counts by Type
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

// Fetch Poems with pagination and search
export const fetchPoems = createAsyncThunk(
  'poems/fetchPoems',
  async ({ page, pageSize, filterType, searchQuery }, { rejectWithValue }) => {
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

        // Apply search filter if searchQuery is provided
        if (searchQuery) {
          reversedPoems = reversedPoems.filter(poem =>
            poem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            poem.htmlContent.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        const totalPoems = reversedPoems.length;
        const paginatedPoems = reversedPoems.slice((page - 1) * pageSize, page * pageSize);

        // Fetch likes and comments for each poem
        const poemsWithLikesAndComments = await Promise.all(
          paginatedPoems.map(async (poem) => {
            const likesSnapshot = await get(ref(db, `PoemData/${poem.id}/likes`));
            const commentsSnapshot = await get(ref(db, `PoemData/${poem.id}/comments`));
            return {
              ...poem,
              likes: likesSnapshot.exists() ? Object.keys(likesSnapshot.val()).length : 0,
              comments: commentsSnapshot.exists() ? Object.values(commentsSnapshot.val()) : [],
            };
          })
        );

        return { poems: poemsWithLikesAndComments, totalPoems };
      }
      return { poems: [], totalPoems: 0 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add Poem and ensure only the latest 3 poems of a type are stored
export const addPoem = createAsyncThunk(
  'poems/addPoem',
  async (newPoem, { rejectWithValue }) => {
    try {
      const poemsRef = ref(db, 'PoemData');
      const newPoemRef = push(poemsRef);
      const poemWithTimestamp = {
        ...newPoem,
        mainType: 'POEM',
        timestamp: Date.now()
      };
      await set(newPoemRef, poemWithTimestamp);

      // Add to separate collection for latest 3 poems
      const latestPoemsRef = ref(db, 'LatestPoems');
      const newLatestPoemRef = push(latestPoemsRef);
      await set(newLatestPoemRef, poemWithTimestamp);

      // Trim the poems of the same type to only 3
      await trimToLatestThreePoems(newPoem.type);

      return { id: newPoemRef.key, ...poemWithTimestamp };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update Poem
export const updatePoem = createAsyncThunk(
  'poems/updatePoem',
  async ({ poemId, updatedPoem }, { rejectWithValue }) => {
    try {
      const poemRef = ref(db, `PoemData/${poemId}`);
      const poemWithUpdatedTimestamp = {
        ...updatedPoem,
        mainType: 'POEM',
        lastUpdated: Date.now()
      };
      await update(poemRef, poemWithUpdatedTimestamp);

      // Ensure the updated poem is stored in LatestPoems
      await set(ref(db, `LatestPoems/${poemId}`), poemWithUpdatedTimestamp);
      await trimToLatestThreePoems(updatedPoem.type);

      return { id: poemId, ...poemWithUpdatedTimestamp };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete Poem
export const deletePoem = createAsyncThunk(
  'poems/deletePoem',
  async (poemId, { rejectWithValue }) => {
    try {
      const poemRef = ref(db, `PoemData/${poemId}`);
      await remove(poemRef);

      // Also remove from LatestPoems
      await remove(ref(db, `LatestPoems/${poemId}`));

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

export const addLike = createAsyncThunk(
  'poems/addLike',
  async ({ poemId, userId }, { rejectWithValue }) => {
    try {
      const likeRef = ref(db, `PoemData/${poemId}/likes/${userId}`);
      await set(likeRef, true);
      return { poemId, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'poems/addComment',
  async ({ poemId, userId, comment }, { rejectWithValue }) => {
    try {
      const commentRef = ref(db, `PoemData/${poemId}/comments/${userId}`);
      await set(commentRef, comment);
      return { poemId, userId, comment };
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
    totalSurprise: 0,
    isLoading: false,
    loadingMessage: '',
    error: null,
    likesCount: {},
    comments: {},
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPoemCounts.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = 'Loading poems...';
        state.error = null;
      })
      .addCase(fetchPoemCounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        Object.assign(state, action.payload);
      })
      .addCase(fetchPoemCounts.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(fetchPoems.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = 'Loading poems...';
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
        state.loadingMessage = 'Adding new poem...';
        state.error = null;
      })
      .addCase(addPoem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.poemsList.unshift(action.payload);
      })
      .addCase(addPoem.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(updatePoem.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = 'Updating poem...';
        state.error = null;
      })
      .addCase(updatePoem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        const poemIndex = state.poemsList.findIndex(poem => poem.id === action.payload.id);
        if (poemIndex !== -1) {
          state.poemsList[poemIndex] = action.payload;
        }
      })
      .addCase(updatePoem.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(deletePoem.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = 'Deleting poem...';
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
      })
      .addCase(addLike.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Adding like...";
        state.error = null;
      })
      .addCase(addLike.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        if (!state.likesCount[action.payload.poemId]) {
          state.likesCount[action.payload.poemId] = 0;
        }
        state.likesCount[action.payload.poemId]++;
      })
      .addCase(addLike.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(addComment.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = "Adding comment...";
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        if (!state.comments[action.payload.poemId]) {
          state.comments[action.payload.poemId] = [];
        }
        state.comments[action.payload.poemId].push({
          userId: action.payload.userId,
          comment: action.payload.comment,
        });
      })
      .addCase(addComment.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      });
  },
});

export const { clearError } = poemsSlice.actions;
export default poemsSlice.reducer;
