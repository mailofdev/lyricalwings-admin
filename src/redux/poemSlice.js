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

export const addPoem = createAsyncThunk(
  'poems/addPoem',
  async (newPoem, { rejectWithValue }) => {
    try {
      const poemsRef = ref(db, 'PoemData');
      const newPoemRef = push(poemsRef);
      const poemWithTimestamp = {
        ...newPoem,
        timestamp: Date.now() // Add current client-side timestamp
      };
      await set(newPoemRef, poemWithTimestamp);
      return { id: newPoemRef.key, ...poemWithTimestamp };
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
      const poemWithUpdatedTimestamp = {
        ...updatedPoem,
        lastUpdated: Date.now() // Add or update lastUpdated field
      };
      await update(poemRef, poemWithUpdatedTimestamp);
      return { id: poemId, ...poemWithUpdatedTimestamp };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// export const updatePoem = createAsyncThunk(
//   'poems/updatePoem',
//   async ({ poemId, updatedPoem }, { rejectWithValue }) => {
//     try {
//       const poemRef = ref(db, `PoemData/${poemId}`);
//       await update(poemRef, updatedPoem);
//       return { id: poemId, ...updatedPoem };
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

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
      setPoemsList: (state, action) => {
        state.poemsList = action.payload;
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
          Object.assign(state, action.payload);
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
