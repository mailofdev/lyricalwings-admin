import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, update, remove } from 'firebase/database';
import { db } from '../Config/firebase';

export const fetchThemes = createAsyncThunk(
  'Themes/fetchThemes',
  async (_, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'ThemeData');
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

export const fetchAppliedTheme = createAsyncThunk(
  'Themes/fetchAppliedTheme',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const appliedThemeRef = ref(db, 'AppliedTheme');
      const snapshot = await get(appliedThemeRef);
      if (snapshot.exists()) {
        const { themeData } = snapshot.val();
        dispatch(applyTheme(themeData.id));
        return themeData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching applied theme:', error);
      return rejectWithValue(error.message);
    }
  }
);



export const addThemes = createAsyncThunk(
  'Themes/addThemes',
  async (itemData, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, 'ThemeData');
      const newItemRef = push(itemsRef);
      await update(newItemRef, itemData);
      return { id: newItemRef.key, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateThemes = createAsyncThunk(
  'Themes/updateThemes',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `ThemeData/${id}`);
      await update(itemRef, itemData);
      return { id, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteThemes = createAsyncThunk(
  'Themes/deleteThemes',
  async (id, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `ThemeData/${id}`);
      await remove(itemRef);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveAppliedTheme = createAsyncThunk(
  'Themes/saveAppliedTheme',
  async (themeData, { rejectWithValue }) => {
    try {
      const appliedThemeRef = ref(db, 'AppliedTheme');
      await update(appliedThemeRef, { themeData });
      return themeData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const applyTheme = createAsyncThunk(
  'Themes/applyTheme',
  async (themeId, { rejectWithValue }) => {
    try {
      const themeRef = ref(db, `ThemeData/${themeId}`);
      const snapshot = await get(themeRef);
      if (snapshot.exists()) {
        return { id: themeId, ...snapshot.val() };
      }
      throw new Error('Theme not found');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const themesSlice = createSlice({
  name: 'Themes',
  initialState: {
    ThemeData: [],
    appliedTheme: null,
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThemes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchThemes.fulfilled, (state, action) => {
        state.loading = false;
        state.ThemeData = action.payload;
      })
      .addCase(fetchThemes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addThemes.fulfilled, (state, action) => {
        state.ThemeData.push(action.payload);
      })
      .addCase(updateThemes.fulfilled, (state, action) => {
        const index = state.ThemeData.findIndex(item => item.id === action.payload.id);
        if (index >= 0) {
          state.ThemeData[index] = action.payload;
        }
      })
      .addCase(deleteThemes.fulfilled, (state, action) => {
        state.ThemeData = state.ThemeData.filter(item => item.id !== action.payload);
      })
      .addCase(saveAppliedTheme.fulfilled, (state, action) => {
        state.appliedTheme = action.payload;
      })
      .addCase(applyTheme.fulfilled, (state, action) => {
        state.appliedTheme = action.payload;
      })
      .addCase(applyTheme.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchAppliedTheme.fulfilled, (state, action) => {
        state.appliedTheme = action.payload;
      })
      .addCase(fetchAppliedTheme.rejected, (state, action) => {
        state.error = action.payload;
      });

  }
});

export const { clearError } = themesSlice.actions;

export default themesSlice.reducer;
