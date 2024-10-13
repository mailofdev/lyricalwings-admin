import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, remove } from 'firebase/database';
import { db } from '../common/firebase';

// Async thunk for fetching poems from Firebase
export const fetchPoems = createAsyncThunk('poems/fetchPoems', async () => {
    const poemsRef = ref(db, 'poems');
    const snapshot = await get(poemsRef);
    const poems = snapshot.val() || {};
    return Object.keys(poems).map(key => ({ id: key, ...poems[key] }));
});

// Async thunk for adding a new poem
export const addPoem = createAsyncThunk('poems/addPoem', async (poemData) => {
    const poemsRef = ref(db, 'poems');
    const newPoemRef = push(poemsRef);
    await set(newPoemRef, poemData);
    return { id: newPoemRef.key, ...poemData };
});

// Async thunk for updating an existing poem
export const updatePoem = createAsyncThunk('poems/updatePoem', async ({ id, poemData }) => {
    const poemRef = ref(db, `poems/${id}`);
    await set(poemRef, poemData);
    return { id, ...poemData };
});

// Async thunk for deleting a poem
export const deletePoem = createAsyncThunk('poems/deletePoem', async (id) => {
    const poemRef = ref(db, `poems/${id}`);
    await remove(poemRef);
    return id;
});

const poemSlice = createSlice({
    name: 'poems',
    initialState: {
        poems: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPoems.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPoems.fulfilled, (state, action) => {
                state.loading = false;
                state.poems = action.payload;
            })
            .addCase(fetchPoems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addPoem.fulfilled, (state, action) => {
                state.poems.push(action.payload);
            })
            .addCase(updatePoem.fulfilled, (state, action) => {
                const index = state.poems.findIndex(poem => poem.id === action.payload.id);
                if (index !== -1) {
                    state.poems[index] = action.payload;
                }
            })
            .addCase(deletePoem.fulfilled, (state, action) => {
                state.poems = state.poems.filter(poem => poem.id !== action.payload);
            });
    },
});

export default poemSlice.reducer;