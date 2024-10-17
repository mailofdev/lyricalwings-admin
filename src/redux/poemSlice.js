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

export const fetchTopThreePoemsByType = createAsyncThunk('poems/fetchTopThreePoemsByType', async (type) => {
    const topThreeRef = ref(db, `topThreePoemsByType/${type}`);
    const snapshot = await get(topThreeRef);
    return snapshot.val() || [];
});

// Updated utility function to update top three poems by type
const updateTopThreePoems = async (type) => {
    const poemsRef = ref(db, 'poems');
    const snapshot = await get(poemsRef);
    const poems = snapshot.val() || {};

    // Filter poems by type and sort by lastUpdated (or createdAt if lastUpdated doesn't exist)
    const poemsOfType = Object.keys(poems)
        .map(key => ({ id: key, ...poems[key] }))
        .filter(poem => poem.type === type)
        .sort((a, b) => (b.lastUpdated || b.createdAt) - (a.lastUpdated || a.createdAt));

    // Get the top three poems (including all data)
    const topThreePoems = poemsOfType.slice(0, 3);

    // Update the "topThreePoemsByType" collection in Firebase
    const topThreeRef = ref(db, `topThreePoemsByType/${type}`);
    await set(topThreeRef, topThreePoems);
};

// Updated async thunk for adding a new poem
export const addPoem = createAsyncThunk('poems/addPoem', async (poemData) => {
    const poemsRef = ref(db, 'poems');
    const newPoemRef = push(poemsRef);
    const newPoem = {
        ...poemData,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        likes: {},
        comments: {}
    };
    await set(newPoemRef, newPoem);

    // Update the top three poems by type
    await updateTopThreePoems(newPoem.type);

    return { id: newPoemRef.key, ...newPoem };
});

// Updated async thunk for updating an existing poem
export const updatePoem = createAsyncThunk('poems/updatePoem', async ({ id, poemData }) => {
    const poemRef = ref(db, `poems/${id}`);
    const snapshot = await get(poemRef);
    const existingPoem = snapshot.val();
    const updatedPoem = {
        ...existingPoem,
        ...poemData,
        lastUpdated: Date.now()
    };
    await set(poemRef, updatedPoem);

    // Update the top three poems by type
    await updateTopThreePoems(updatedPoem.type);

    return { id, ...updatedPoem };
});

// Updated async thunk for deleting a poem
export const deletePoem = createAsyncThunk('poems/deletePoem', async (id) => {
    const poemRef = ref(db, `poems/${id}`);
    const snapshot = await get(poemRef);
    const poemData = snapshot.val();
    await remove(poemRef);

    // Update the top three poems by type after deletion
    if (poemData && poemData.type) {
        await updateTopThreePoems(poemData.type);
    }

    // Remove the poem from topThreePoemsByType if it exists
    const topThreeRef = ref(db, `topThreePoemsByType/${poemData.type}`);
    const topThreeSnapshot = await get(topThreeRef);
    const topThreePoems = topThreeSnapshot.val() || [];
    const updatedTopThree = topThreePoems.filter(poem => poem.id !== id);
    await set(topThreeRef, updatedTopThree);

    return id;
});

// Updated async thunk for adding a like to a poem
export const addLike = createAsyncThunk('poems/addLike', async ({ poemId, userName }) => {
    const likeRef = ref(db, `poems/${poemId}/likes/${userName}`);
    await set(likeRef, true);

    // Update the top three poems by type
    const poemRef = ref(db, `poems/${poemId}`);
    const snapshot = await get(poemRef);
    const poemData = snapshot.val();
    if (poemData && poemData.type) {
        await updateTopThreePoems(poemData.type);
    }

    return { poemId, userName };
});

// Updated async thunk for removing a like from a poem
export const removeLike = createAsyncThunk('poems/removeLike', async ({ poemId, userName }) => {
    const likeRef = ref(db, `poems/${poemId}/likes/${userName}`);
    await remove(likeRef);

    // Update the top three poems by type
    const poemRef = ref(db, `poems/${poemId}`);
    const snapshot = await get(poemRef);
    const poemData = snapshot.val();
    if (poemData && poemData.type) {
        await updateTopThreePoems(poemData.type);
    }

    return { poemId, userName };
});

// Updated async thunk for adding a comment to a poem
export const addComment = createAsyncThunk('poems/addComment', async ({ poemId, userName, comment }) => {
    const commentsRef = ref(db, `poems/${poemId}/comments`);
    const newCommentRef = push(commentsRef);
    const commentData = {
        userName,
        text: comment,
        timestamp: Date.now()
    };
    await set(newCommentRef, commentData);

    // Update the top three poems by type
    const poemRef = ref(db, `poems/${poemId}`);
    const snapshot = await get(poemRef);
    const poemData = snapshot.val();
    if (poemData && poemData.type) {
        await updateTopThreePoems(poemData.type);
    }

    return { poemId, commentId: newCommentRef.key, ...commentData };
});

const poemSlice = createSlice({
    name: 'poems',
    initialState: {
        poems: [],
        topThreePoems: {},
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
            })
            .addCase(addLike.fulfilled, (state, action) => {
                const { poemId, userName } = action.payload;
                const poem = state.poems.find(p => p.id === poemId);
                if (poem) {
                    if (!poem.likes) poem.likes = {};
                    poem.likes[userName] = true;
                }
            })
            .addCase(removeLike.fulfilled, (state, action) => {
                const { poemId, userName } = action.payload;
                const poem = state.poems.find(p => p.id === poemId);
                if (poem && poem.likes) {
                    delete poem.likes[userName];
                }
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const { poemId, commentId, ...commentData } = action.payload;
                const poem = state.poems.find(p => p.id === poemId);
                if (poem) {
                    if (!poem.comments) poem.comments = {};
                    poem.comments[commentId] = commentData;
                }
            })
            .addCase(fetchTopThreePoemsByType.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTopThreePoemsByType.fulfilled, (state, action) => {
                state.loading = false;
                state.topThreePoems[action.meta.arg] = action.payload;
            })
            .addCase(fetchTopThreePoemsByType.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default poemSlice.reducer;