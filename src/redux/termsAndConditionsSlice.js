import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, remove } from 'firebase/database';
import { db } from '../common/firebase';

// Async thunk for fetching terms and conditions from Firebase
export const fetchTermsAndConditions = createAsyncThunk('termsAndConditions/fetchTermsAndConditions', async () => {
    const termsAndConditionsRef = ref(db, 'termsAndConditions');
    const snapshot = await get(termsAndConditionsRef);
    const termsAndConditions = snapshot.val() || {};
    return Object.keys(termsAndConditions).map(key => ({ 
        id: key, 
        ...termsAndConditions[key],
        // Ensure createdAt and lastUpdated are numbers
        createdAt: Number(termsAndConditions[key].createdAt) || Date.now(),
        lastUpdated: Number(termsAndConditions[key].lastUpdated) || Date.now()
    }));
});

// Async thunk for adding new terms and conditions
export const addTermsAndConditions = createAsyncThunk('termsAndConditions/addTermsAndConditions', async (termsAndConditionsData) => {
    const timestamp = Date.now();
    const newTermsAndConditionsData = {
        ...termsAndConditionsData,
        createdAt: timestamp,
        lastUpdated: timestamp,
        likes: {},
        comments: {}
    };
    
    const termsAndConditionsRef = ref(db, 'termsAndConditions');
    const newTermsAndConditionsRef = push(termsAndConditionsRef);
    await set(newTermsAndConditionsRef, newTermsAndConditionsData);
    return { id: newTermsAndConditionsRef.key, ...newTermsAndConditionsData };
});

// Async thunk for updating existing terms and conditions
export const updateTermsAndConditions = createAsyncThunk('termsAndConditions/updateTermsAndConditions', async ({ id, termsAndConditionsData }) => {
    const updatedTermsAndConditionsData = {
        ...termsAndConditionsData,
        lastUpdated: Date.now()
    };
    const termsAndConditionsRef = ref(db, `termsAndConditions/${id}`);
    await set(termsAndConditionsRef, updatedTermsAndConditionsData);
    return { id, ...updatedTermsAndConditionsData };
});

// Async thunk for deleting terms and conditions
export const deleteTermsAndConditions = createAsyncThunk('termsAndConditions/deleteTermsAndConditions', async (id) => {
    const termsAndConditionsRef = ref(db, `termsAndConditions/${id}`);
    await remove(termsAndConditionsRef);
    return id;
});

// Selectors

const termsAndConditionsSlice = createSlice({
    name: 'termsAndConditions',
    initialState: {
        termsAndConditions: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTermsAndConditions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTermsAndConditions.fulfilled, (state, action) => {
                state.loading = false;
                state.termsAndConditions = action.payload;
                state.error = null;
            })
            .addCase(fetchTermsAndConditions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addTermsAndConditions.fulfilled, (state, action) => {
                state.termsAndConditions.push(action.payload);
            })
            .addCase(updateTermsAndConditions.fulfilled, (state, action) => {
                const index = state.termsAndConditions.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.termsAndConditions[index] = action.payload;
                }
            })
            .addCase(deleteTermsAndConditions.fulfilled, (state, action) => {
                state.termsAndConditions = state.termsAndConditions.filter(item => item.id !== action.payload);
            });
    },
});

export default termsAndConditionsSlice.reducer;