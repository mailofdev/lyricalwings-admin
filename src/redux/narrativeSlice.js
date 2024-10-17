import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { get, ref, push, set, remove } from 'firebase/database';
import { db } from '../common/firebase';

// Async thunk for fetching narratives from Firebase
export const fetchNarratives = createAsyncThunk('narratives/fetchNarratives', async () => {
    const narrativesRef = ref(db, 'narratives');
    const snapshot = await get(narrativesRef);
    const narratives = snapshot.val() || {};
    return Object.keys(narratives).map(key => ({ 
        id: key, 
        ...narratives[key],
        // Ensure createdAt and lastUpdated are numbers
        createdAt: Number(narratives[key].createdAt) || Date.now(),
        lastUpdated: Number(narratives[key].lastUpdated) || Date.now()
    }));
});

// Async thunk for adding a new narrative
export const addNarrative = createAsyncThunk('narratives/addNarrative', async (narrativeData) => {
    const timestamp = Date.now();
    const newNarrativeData = {
        ...narrativeData,
        createdAt: timestamp,
        lastUpdated: timestamp,
        likes: {},
        comments: {}
    };
    
    const narrativesRef = ref(db, 'narratives');
    const newNarrativeRef = push(narrativesRef);
    await set(newNarrativeRef, newNarrativeData);
    return { id: newNarrativeRef.key, ...newNarrativeData };
});

// Async thunk for updating an existing narrative
export const updateNarrative = createAsyncThunk('narratives/updateNarrative', async ({ id, narrativeData }) => {
    const updatedNarrativeData = {
        ...narrativeData,
        lastUpdated: Date.now()
    };
    const narrativeRef = ref(db, `narratives/${id}`);
    await set(narrativeRef, updatedNarrativeData);
    return { id, ...updatedNarrativeData };
});

// Selectors
export const selectAllNarratives = state => state.narratives.narratives;

export const selectLatestNarratives = createSelector(
    [selectAllNarratives],
    (narratives) => {
        return [...narratives]
            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
            .slice(0, 3);
    }
);

export const selectMostLikedNarratives = createSelector(
    [selectAllNarratives],
    (narratives) => {
        return [...narratives]
            .sort((a, b) => {
                const likesA = a.likes ? Object.keys(a.likes).length : 0;
                const likesB = b.likes ? Object.keys(b.likes).length : 0;
                return likesB - likesA;
            })
            .slice(0, 3);
    }
);

// Async thunk for deleting a narrative
export const deleteNarrative = createAsyncThunk('narratives/deleteNarrative', async (id) => {
    const narrativeRef = ref(db, `narratives/${id}`);
    await remove(narrativeRef);
    return id;
});

// Async thunk for adding a like to a narrative
export const addLike = createAsyncThunk('narratives/addLike', async ({ narrativeId, userName }) => {
    const likeRef = ref(db, `narratives/${narrativeId}/likes/${userName}`);
    await set(likeRef, true);
    return { narrativeId, userName };
});

// Async thunk for removing a like from a narrative
export const removeLike = createAsyncThunk('narratives/removeLike', async ({ narrativeId, userName }) => {
    const likeRef = ref(db, `narratives/${narrativeId}/likes/${userName}`);
    await remove(likeRef);
    return { narrativeId, userName };
});

// Async thunk for adding a comment to a narrative
export const addComment = createAsyncThunk('narratives/addComment', async ({ narrativeId, userName, comment }) => {
    const commentsRef = ref(db, `narratives/${narrativeId}/comments`);
    const newCommentRef = push(commentsRef);
    const commentData = {
        userName,
        text: comment,
        timestamp: Date.now()
    };
    await set(newCommentRef, commentData);
    return { narrativeId, commentId: newCommentRef.key, ...commentData };
});

const narrativeSlice = createSlice({
    name: 'narratives',
    initialState: {
        narratives: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNarratives.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNarratives.fulfilled, (state, action) => {
                state.loading = false;
                state.narratives = action.payload;
                state.error = null;
            })
            .addCase(fetchNarratives.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addNarrative.fulfilled, (state, action) => {
                state.narratives.push(action.payload);
            })
            .addCase(updateNarrative.fulfilled, (state, action) => {
                const index = state.narratives.findIndex(narrative => narrative.id === action.payload.id);
                if (index !== -1) {
                    state.narratives[index] = action.payload;
                }
            })
            .addCase(deleteNarrative.fulfilled, (state, action) => {
                state.narratives = state.narratives.filter(narrative => narrative.id !== action.payload);
            })
            .addCase(addLike.fulfilled, (state, action) => {
                const { narrativeId, userName } = action.payload;
                const narrative = state.narratives.find(n => n.id === narrativeId);
                if (narrative) {
                    if (!narrative.likes) narrative.likes = {};
                    narrative.likes[userName] = true;
                }
            })
            .addCase(removeLike.fulfilled, (state, action) => {
                const { narrativeId, userName } = action.payload;
                const narrative = state.narratives.find(n => n.id === narrativeId);
                if (narrative && narrative.likes) {
                    delete narrative.likes[userName];
                }
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const { narrativeId, commentId, ...commentData } = action.payload;
                const narrative = state.narratives.find(n => n.id === narrativeId);
                if (narrative) {
                    if (!narrative.comments) narrative.comments = {};
                    narrative.comments[commentId] = commentData;
                }
            });
    },
});

export default narrativeSlice.reducer;