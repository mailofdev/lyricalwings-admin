import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDatabase, ref, onValue } from 'firebase/database';

// Async thunk to fetch data
export const fetchDashboardData = createAsyncThunk('dashboard/fetchData', async (_, { rejectWithValue }) => {
  try {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const poemsRef = ref(db, 'AllPoems');
    const aboutRef = ref(db, 'About');
    const storyAndNovelsRef = ref(db, 'storyAndNovels');
    
    const fetchData = (ref) => new Promise((resolve, reject) => {
      onValue(ref, snapshot => resolve(snapshot.val()), reject);
    });

    const [users, dashboardPoems, about, storyAndNovels] = await Promise.all([
      fetchData(usersRef),
      fetchData(poemsRef),
      fetchData(aboutRef),
      fetchData(storyAndNovelsRef)
    ]);

    return { users, dashboardPoems, about, storyAndNovels };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    users: [],
    dashboardPoems: { totalPoems: 0, emotionsCount: {} },
    booksLength: 0,
    storyLength: 0,
    novelLength: 0,
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        const { users, dashboardPoems, about, storyAndNovels } = action.payload;
        
        // Process users data
        state.users = users ? Object.entries(users).map(([key, value]) => ({ id: key, ...value })) : [];
        
        // Process dashboardPoems data
        if (dashboardPoems) {
          const emotionsCount = {};
          let totalPoems = 0;
          Object.values(dashboardPoems).forEach(poem => {
            totalPoems++;
            emotionsCount[poem.emotion] = emotionsCount[poem.emotion] ? emotionsCount[poem.emotion] + 1 : 1;
          });

          // Ensure all possible emotions are included
          ['happiness', 'sadness', 'anger', 'fear', 'disgust'].forEach(emotion => {
            if (!emotionsCount[emotion]) {
              emotionsCount[emotion] = 0;
            }
          });

          state.dashboardPoems = { totalPoems, emotionsCount };
        }

        // Process about data
        state.booksLength = about && about.myBooks ? Object.keys(about.myBooks).length : 0;

        // Process story and novels data
        let storyLength = 0;
        let novelLength = 0;
        if (storyAndNovels) {
          Object.values(storyAndNovels).forEach(item => {
            if (item.type === 'stories') {
              storyLength++;
            } else if (item.type === 'novel') {
              novelLength++;
            }
          });
        }
        state.storyLength = storyLength;
        state.novelLength = novelLength;
        state.status = 'succeeded';
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default dashboardSlice.reducer;
