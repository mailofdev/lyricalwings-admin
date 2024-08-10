import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, ref, set, get } from '../Config/firebase';

export const fetchAboutData = createAsyncThunk(
  'about/fetchData',
  async (sectionKey, { rejectWithValue }) => {
    try {
      const aboutRef = ref(db, `About/${sectionKey}`);
      const snapshot = await get(aboutRef);
      if (snapshot.exists()) {
        return { [sectionKey]: snapshot.val() };
      }
      return { [sectionKey]: {} };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveAboutData = createAsyncThunk(
  'about/saveData',
  async ({ sectionKey, id, data }, { rejectWithValue }) => {
    try {
      const aboutRef = ref(db, `About/${sectionKey}/${id}`);
      await set(aboutRef, data);
      return { sectionKey, id, data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAboutData = createAsyncThunk(
  'about/deleteData',
  async ({ sectionKey, id }, { rejectWithValue }) => {
    try {
      await set(ref(db, `About/${sectionKey}/${id}`), null);
      return { sectionKey, id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const aboutSlice = createSlice({
  name: 'about',
  initialState: {
    aboutUs: {},
    aboutme: {},
    myBooks: {},
    loading: false,
    error: null,
    saveLoading: false,
    deleteLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Data
      .addCase(fetchAboutData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAboutData.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchAboutData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Data
      .addCase(saveAboutData.pending, (state) => {
        state.saveLoading = true;
        state.error = null;
      })
      .addCase(saveAboutData.fulfilled, (state, action) => {
        state.saveLoading = false;
        const { sectionKey, id, data } = action.payload;
        state[sectionKey][id] = data;
      })
      .addCase(saveAboutData.rejected, (state, action) => {
        state.saveLoading = false;
        state.error = action.payload;
      })
      // Delete Data
      .addCase(deleteAboutData.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteAboutData.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { sectionKey, id } = action.payload;
        delete state[sectionKey][id];
      })
      .addCase(deleteAboutData.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export default aboutSlice.reducer;
