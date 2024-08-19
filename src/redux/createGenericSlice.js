import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../Config/firebase';

const createGenericSlice = (name, firebasePath, typeField = 'type') => {
  // Fetch counts
  const fetchCounts = createAsyncThunk(
    `${name}/fetchCounts`,
    async (_, { rejectWithValue }) => {
      try {
        const itemsRef = ref(db, firebasePath);
        const snapshot = await get(itemsRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const totalCount = Object.keys(data).length;
          const typeCounts = Object.values(data).reduce((acc, item) => {
            acc[item[typeField]] = (acc[item[typeField]] || 0) + 1;
            return acc;
          }, {});
          return { totalCount, ...typeCounts };
        }
        
        return { totalCount: 0 };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

  // Fetch items
  const fetchItems = createAsyncThunk(
    `${name}/fetchItems`,
    async ({ page, pageSize, filterType }, { rejectWithValue }) => {
      try {
        const itemsRef = ref(db, firebasePath);
        let dbQuery = filterType && filterType !== 'all' 
          ? query(itemsRef, orderByChild(typeField), equalTo(filterType))
          : itemsRef;

        const snapshot = await get(dbQuery);
        if (snapshot.exists()) {
          let data = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
          let reversedData = data.slice().reverse();

          const totalCount = reversedData.length;
          const paginatedData = reversedData.slice((page - 1) * pageSize, page * pageSize);

          return { items: paginatedData, totalCount };
        }
        return { items: [], totalCount: 0 };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

  // Add item
  const addItem = createAsyncThunk(
    `${name}/addItem`,
    async (itemData, { rejectWithValue }) => {
      try {
        const itemsRef = ref(db, firebasePath);
        const newItemRef = push(itemsRef);
        await set(newItemRef, itemData);
        return { id: newItemRef.key, ...itemData };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

  // Update item
  const updateItem = createAsyncThunk(
    `${name}/updateItem`,
    async ({ id, itemData }, { rejectWithValue }) => {
      try {
        const itemRef = ref(db, `${firebasePath}/${id}`);
        await update(itemRef, itemData);
        return { id, ...itemData };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

  // Delete item
  const deleteItem = createAsyncThunk(
    `${name}/deleteItem`,
    async (id, { rejectWithValue }) => {
      try {
        const itemRef = ref(db, `${firebasePath}/${id}`);
        await remove(itemRef);
        return id;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

  // Delete all items
  const deleteAllItems = createAsyncThunk(
    `${name}/deleteAllItems`,
    async (_, { rejectWithValue }) => {
      try {
        const itemsRef = ref(db, firebasePath);
        await remove(itemsRef);
        return true;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

  const slice = createSlice({
    name,
    initialState: {
      items: [],
      totalCount: 0,
      typeCounts: {},
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
        .addCase(fetchCounts.pending, (state) => {
          state.isLoading = true;
          state.loadingMessage = `Fetching ${name} counts...`;
          state.error = null;
        })
        .addCase(fetchCounts.fulfilled, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.totalCount = action.payload.totalCount;
          state.typeCounts = action.payload;
        })
        .addCase(fetchCounts.rejected, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.error = action.payload;
        })
        .addCase(fetchItems.pending, (state) => {
          state.isLoading = true;
          state.loadingMessage = `Loading ${name}...`;
          state.error = null;
        })
        .addCase(fetchItems.fulfilled, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.items = action.payload.items;
          state.totalCount = action.payload.totalCount;
        })
        .addCase(fetchItems.rejected, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.error = action.payload;
        })
        .addCase(addItem.pending, (state) => {
          state.isLoading = true;
          state.loadingMessage = `Adding new ${name}...`;
          state.error = null;
        })
        .addCase(addItem.fulfilled, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.items.push(action.payload);
        })
        .addCase(addItem.rejected, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.error = action.payload;
        })
        .addCase(updateItem.pending, (state) => {
          state.isLoading = true;
          state.loadingMessage = `Updating ${name}...`;
          state.error = null;
        })
        .addCase(updateItem.fulfilled, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          const index = state.items.findIndex(item => item.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        })
        .addCase(updateItem.rejected, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.error = action.payload;
        })
        .addCase(deleteItem.pending, (state) => {
          state.isLoading = true;
          state.loadingMessage = `Deleting ${name}...`;
          state.error = null;
        })
        .addCase(deleteItem.fulfilled, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.items = state.items.filter(item => item.id !== action.payload);
        })
        .addCase(deleteItem.rejected, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.error = action.payload;
        })
        .addCase(deleteAllItems.pending, (state) => {
          state.isLoading = true;
          state.loadingMessage = `Deleting all ${name}...`;
          state.error = null;
        })
        .addCase(deleteAllItems.fulfilled, (state) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.items = [];
          state.totalCount = 0;
          state.typeCounts = {};
        })
        .addCase(deleteAllItems.rejected, (state, action) => {
          state.isLoading = false;
          state.loadingMessage = '';
          state.error = action.payload;
        });
    },
  });

  return {
    reducer: slice.reducer,
    actions: {
      ...slice.actions,
      fetchCounts,
      fetchItems,
      addItem,
      updateItem,
      deleteItem,
      deleteAllItems,
    },
  };
};

export default createGenericSlice;