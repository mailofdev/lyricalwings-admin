import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, update, remove } from 'firebase/database';
import { db } from '../Config/firebase';

export const fetchAbout = createAsyncThunk(
  'about/fetchAbout',
  async (_, { rejectWithValue }) => {
    try {
      const aboutMeRef = ref(db, 'about/aboutMeData');
      const aboutUsRef = ref(db, 'about/aboutUsData');
      const [aboutMeSnapshot, aboutUsSnapshot] = await Promise.all([get(aboutMeRef), get(aboutUsRef)]);

      const aboutMeData = aboutMeSnapshot.exists() ? Object.entries(aboutMeSnapshot.val()).map(([id, data]) => ({ id, ...data })) : [];
      const aboutUsData = aboutUsSnapshot.exists() ? Object.entries(aboutUsSnapshot.val()).map(([id, data]) => ({ id, ...data })) : [];

      return { aboutMeData, aboutUsData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addAbout = createAsyncThunk(
  'about/addAbout',
  async ({ type, itemData }, { rejectWithValue }) => {
    try {
      const itemsRef = ref(db, `about/${type}Data`);
      const newItemRef = push(itemsRef);
      await update(newItemRef, itemData);
      return { id: newItemRef.key, ...itemData, type };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAbout = createAsyncThunk(
  'about/updateAbout',
  async ({ id, type, itemData }, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `about/${type}Data/${id}`);
      await update(itemRef, itemData);
      return { id, type, ...itemData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAbout = createAsyncThunk(
  'about/deleteAbout',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      const itemRef = ref(db, `about/${type}Data/${id}`);
      await remove(itemRef);
      return { id, type };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const aboutSlice = createSlice({
  name: 'about',
  initialState: {
    aboutMeData: [],
    aboutUsData: [],
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
      .addCase(fetchAbout.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAbout.fulfilled, (state, action) => {
        state.aboutMeData = action.payload.aboutMeData;
        state.aboutUsData = action.payload.aboutUsData;
        state.loading = false;
      })
      .addCase(fetchAbout.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(addAbout.fulfilled, (state, action) => {
        if (action.payload.type === 'aboutMe') {
          state.aboutMeData.push(action.payload);
        } else {
          state.aboutUsData.push(action.payload);
        }
      })
      .addCase(updateAbout.fulfilled, (state, action) => {
        const { id, type, ...updatedData } = action.payload;
        const items = type === 'aboutMe' ? state.aboutMeData : state.aboutUsData;
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          items[index] = { ...items[index], ...updatedData };
        }
      })
      .addCase(deleteAbout.fulfilled, (state, action) => {
        const { id, type } = action.payload;
        const items = type === 'aboutMe' ? state.aboutMeData : state.aboutUsData;
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          items.splice(index, 1);
        }
      });
  }
});

export const { clearError } = aboutSlice.actions;
export default aboutSlice.reducer;
