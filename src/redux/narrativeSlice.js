import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, remove } from 'firebase/database';
import { db } from '../common/firebase';

// Async thunk for fetching narrative from Firebase
export const fetchnarrative = createAsyncThunk('narrative/fetchnarrative', async () => {
    const narrativeRef = ref(db, 'narrative');
    const snapshot = await get(narrativeRef);
    const narrative = snapshot.val() || {};
    return Object.keys(narrative).map(key => ({ id: key, ...narrative[key] }));
});

// Async thunk for adding a new poem
export const addPoem = createAsyncThunk('narrative/addPoem', async (poemData) => {
    const narrativeRef = ref(db, 'narrative');
    const newPoemRef = push(narrativeRef);
    await set(newPoemRef, poemData);
    return { id: newPoemRef.key, ...poemData };
});

// Async thunk for updating an existing poem
export const updatePoem = createAsyncThunk('narrative/updatePoem', async ({ id, poemData }) => {
    const poemRef = ref(db, `narrative/${id}`);
    await set(poemRef, poemData);
    return { id, ...poemData };
});

// Async thunk for deleting a poem
export const deletePoem = createAsyncThunk('narrative/deletePoem', async (id) => {
    const poemRef = ref(db, `narrative/${id}`);
    await remove(poemRef);
    return id;
});

// New async thunk for adding a like to a poem
export const addLike = createAsyncThunk('narrative/addLike', async ({ poemId, userName }) => {
    const likeRef = ref(db, `narrative/${poemId}/likes/${userName}`);
    await set(likeRef, true);
    return { poemId, userName };
});

// New async thunk for removing a like from a poem
export const removeLike = createAsyncThunk('narrative/removeLike', async ({ poemId, userName }) => {
    const likeRef = ref(db, `narrative/${poemId}/likes/${userName}`);
    await remove(likeRef);
    return { poemId, userName };
});

// New async thunk for adding a comment to a poem
export const addComment = createAsyncThunk('narrative/addComment', async ({ poemId, userName, comment }) => {
    const commentsRef = ref(db, `narrative/${poemId}/comments`);
    const newCommentRef = push(commentsRef);
    const commentData = {
        userName,
        text: comment,
        timestamp: Date.now()
    };
    await set(newCommentRef, commentData);
    return { poemId, commentId: newCommentRef.key, ...commentData };
});


const narrativeSlice = createSlice({
    name: 'narrative',
    initialState: {
        narrative: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchnarrative.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchnarrative.fulfilled, (state, action) => {
                state.loading = false;
                state.narrative = action.payload;
            })
            .addCase(fetchnarrative.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addPoem.fulfilled, (state, action) => {
                state.narrative.push(action.payload);
            })
            .addCase(updatePoem.fulfilled, (state, action) => {
                const index = state.narrative.findIndex(poem => poem.id === action.payload.id);
                if (index !== -1) {
                    state.narrative[index] = action.payload;
                }
            })
            .addCase(deletePoem.fulfilled, (state, action) => {
                state.narrative = state.narrative.filter(poem => poem.id !== action.payload);
            })
            .addCase(addLike.fulfilled, (state, action) => {
                const { poemId, userName } = action.payload;
                const poem = state.narrative.find(p => p.id === poemId);
                if (poem) {
                    if (!poem.likes) poem.likes = {};
                    poem.likes[userName] = true;
                }
            })
            .addCase(removeLike.fulfilled, (state, action) => {
                const { poemId, userName } = action.payload;
                const poem = state.narrative.find(p => p.id === poemId);
                if (poem && poem.likes) {
                    delete poem.likes[userName];
                }
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const { poemId, commentId, ...commentData } = action.payload;
                const poem = state.narrative.find(p => p.id === poemId);
                if (poem) {
                    if (!poem.comments) poem.comments = {};
                    poem.comments[commentId] = commentData;
                }
            });
    },
});

export default narrativeSlice.reducer;