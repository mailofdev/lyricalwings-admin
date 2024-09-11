import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../Config/firebase';

// Mapping for categories to database names and types
const dbMappings = {
  Poem: { dbName: 'PoemData', type: 'POEM' },
  Narrative: { dbName: 'NarrativeData', type: 'NARRATIVE' },
};

// Helper functions
const getDbMappings = (category) => dbMappings[category] || dbMappings['Poem'];

// Common logic for Firebase references based on category and filter type
const getQueryRef = (category, filterType) => {
  const { dbName } = getDbMappings(category);
  const dataRef = ref(db, dbName);
  return filterType && filterType !== 'all'
    ? query(dataRef, orderByChild('type'), equalTo(filterType))
    : dataRef;
};

// Asynchronous actions for fetching, creating, updating, and deleting data
export const FetchData = createAsyncThunk(
  'data/FetchData',
  async ({ page, pageSize, filterType, searchQuery, category }, { rejectWithValue }) => {
    try {
      const queryRef = getQueryRef(category, filterType);
      const snapshot = await get(queryRef);

      if (snapshot.exists()) {
        let dataArray = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
        let reversedData = dataArray.reverse();

        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase();
          reversedData = reversedData.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.htmlContent.toLowerCase().includes(lowerQuery)
          );
        }

        const totalItems = reversedData.length;
        const paginatedData = reversedData.slice((page - 1) * pageSize, page * pageSize);

        return { items: paginatedData, totalItems };
      }
      return { items: [], totalItems: 0 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const CreateData = createAsyncThunk(
  'data/CreateData',
  async ({ newItem, category }, { rejectWithValue }) => {
    try {
      const { dbName, type } = getDbMappings(category);
      const dataRef = ref(db, dbName);
      const newItemRef = push(dataRef);
      const itemWithTimestamp = {
        ...newItem,
        mainType: type,
        timestamp: Date.now()
      };
      await set(newItemRef, itemWithTimestamp);
      return { id: newItemRef.key, ...itemWithTimestamp };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const UpdateData = createAsyncThunk(
  'data/UpdateData',
  async ({ itemId, updatedItem, category }, { rejectWithValue }) => {
    try {
      const { dbName, type } = getDbMappings(category);
      const itemRef = ref(db, `${dbName}/${itemId}`);
      const itemWithUpdatedTimestamp = {
        ...updatedItem,
        mainType: type,
        lastUpdated: Date.now()
      };
      await update(itemRef, itemWithUpdatedTimestamp);
      return { id: itemId, ...itemWithUpdatedTimestamp };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const DeleteData = createAsyncThunk(
  'data/DeleteData',
  async ({ itemId, category }, { rejectWithValue }) => {
    try {
      const { dbName } = getDbMappings(category);
      const itemRef = ref(db, `${dbName}/${itemId}`);
      await remove(itemRef);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Redux slice for handling the state
const AddDataSlice = createSlice({
  name: 'AddData',
  initialState: {
    itemsList: [],
    totalItems: 0,
    isLoading: false,
    loadingMessage: '',
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(FetchData.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = 'Loading data...';
        state.error = null;
      })
      .addCase(FetchData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.itemsList = action.payload.items;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(FetchData.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(CreateData.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = 'Adding new item...';
        state.error = null;
      })
      .addCase(CreateData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.itemsList.unshift(action.payload);
        state.totalItems += 1;
      })
      .addCase(CreateData.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(UpdateData.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = 'Updating item...';
        state.error = null;
      })
      .addCase(UpdateData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        const itemIndex = state.itemsList.findIndex(item => item.id === action.payload.id);
        if (itemIndex !== -1) {
          state.itemsList[itemIndex] = action.payload;
        }
      })
      .addCase(UpdateData.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      })
      .addCase(DeleteData.pending, (state) => {
        state.isLoading = true;
        state.loadingMessage = 'Deleting item...';
        state.error = null;
      })
      .addCase(DeleteData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.itemsList = state.itemsList.filter(item => item.id !== action.payload);
        state.totalItems -= 1;
      })
      .addCase(DeleteData.rejected, (state, action) => {
        state.isLoading = false;
        state.loadingMessage = '';
        state.error = action.payload;
      });
  }
});

export const { clearError } = AddDataSlice.actions;
export default AddDataSlice.reducer;
