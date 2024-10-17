import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, ref, push, set, remove } from 'firebase/database';
import { db } from '../common/firebase';

// Async thunk for fetching narratives from Firebase
export const fetchNarratives = createAsyncThunk('narratives/fetchNarratives', async () => {
    const narrativesRef = ref(db, 'narratives');
    const snapshot = await get(narrativesRef);
    const narratives = snapshot.val() || {};
    return Object.keys(narratives).map(key => ({ id: key, ...narratives[key] }));
});

export const fetchTopThreeNarrativesByType = createAsyncThunk('narratives/fetchTopThreeNarrativesByType', async (type) => {
    const topThreeRef = ref(db, `topThreeNarrativesByType/${type}`);
    const snapshot = await get(topThreeRef);
    return snapshot.val() || [];
});

// Updated utility function to update top three narratives by type
const updateTopThreeNarratives = async (type) => {
    const narrativesRef = ref(db, 'narratives');
    const snapshot = await get(narrativesRef);
    const narratives = snapshot.val() || {};

    // Filter narratives by type and sort by lastUpdated (or createdAt if lastUpdated doesn't exist)
    const narrativesOfType = Object.keys(narratives)
        .map(key => ({ id: key, ...narratives[key] }))
        .filter(narrative => narrative.type === type)
        .sort((a, b) => (b.lastUpdated || b.createdAt) - (a.lastUpdated || a.createdAt));

    // Get the top three narratives (including all data)
    const topThreeNarratives = narrativesOfType.slice(0, 3);

    // Update the "topThreeNarrativesByType" collection in Firebase
    const topThreeRef = ref(db, `topThreeNarrativesByType/${type}`);
    await set(topThreeRef, topThreeNarratives);
};

// Updated async thunk for adding a new narrative
export const addNarrative = createAsyncThunk('narratives/addNarrative', async (narrativeData) => {
    const narrativesRef = ref(db, 'narratives');
    const newNarrativeRef = push(narrativesRef);
    const newNarrative = {
        ...narrativeData,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        likes: {},
        comments: {}
    };
    await set(newNarrativeRef, newNarrative);

    // Update the top three narratives by type
    await updateTopThreeNarratives(newNarrative.type);

    return { id: newNarrativeRef.key, ...newNarrative };
});

// Updated async thunk for updating an existing narrative
export const updateNarrative = createAsyncThunk('narratives/updateNarrative', async ({ id, narrativeData }) => {
    const narrativeRef = ref(db, `narratives/${id}`);
    const snapshot = await get(narrativeRef);
    const existingNarrative = snapshot.val();
    const updatedNarrative = {
        ...existingNarrative,
        ...narrativeData,
        lastUpdated: Date.now()
    };
    await set(narrativeRef, updatedNarrative);

    // Update the top three narratives by type
    await updateTopThreeNarratives(updatedNarrative.type);

    return { id, ...updatedNarrative };
});

// Updated async thunk for deleting a narrative
export const deleteNarrative = createAsyncThunk('narratives/deleteNarrative', async (id) => {
    const narrativeRef = ref(db, `narratives/${id}`);
    const snapshot = await get(narrativeRef);
    const narrativeData = snapshot.val();
    await remove(narrativeRef);

    // Update the top three narratives by type after deletion
    if (narrativeData && narrativeData.type) {
        await updateTopThreeNarratives(narrativeData.type);
    }

    // Remove the narrative from topThreeNarrativesByType if it exists
    const topThreeRef = ref(db, `topThreeNarrativesByType/${narrativeData.type}`);
    const topThreeSnapshot = await get(topThreeRef);
    const topThreeNarratives = topThreeSnapshot.val() || [];
    const updatedTopThree = topThreeNarratives.filter(narrative => narrative.id !== id);
    await set(topThreeRef, updatedTopThree);

    return id;
});

export const addLike = createAsyncThunk('narratives/addLike', async ({ narrativeId, userName }) => {
    console.log(userName)
    const likeRef = ref(db, `narratives/${narrativeId}/likes/${userName}`);
    await set(likeRef, true);

    // Update the top three narratives by type
    const narrativeRef = ref(db, `narratives/${narrativeId}`);
    const snapshot = await get(narrativeRef);
    const narrativeData = snapshot.val();
    if (narrativeData && narrativeData.type) {
        await updateTopThreeNarratives(narrativeData.type);
    }

    return { narrativeId, userName };
});

// Updated async thunk for removing a like from a narrative
export const removeLike = createAsyncThunk('narratives/removeLike', async ({ narrativeId, userName }) => {
    const likeRef = ref(db, `narratives/${narrativeId}/likes/${userName}`);
    await remove(likeRef);

    // Update the top three narratives by type
    const narrativeRef = ref(db, `narratives/${narrativeId}`);
    const snapshot = await get(narrativeRef);
    const narrativeData = snapshot.val();
    if (narrativeData && narrativeData.type) {
        await updateTopThreeNarratives(narrativeData.type);
    }

    return { narrativeId, userName };
});

// Updated async thunk for adding a comment to a narrative
export const addComment = createAsyncThunk('narratives/addComment', async ({ narrativeId, userName, comment }) => {
    const commentsRef = ref(db, `narratives/${narrativeId}/comments`);
    const newCommentRef = push(commentsRef);
    const commentData = {
        userName,
        text: comment,
        timestamp: Date.now()
    };
    await set(newCommentRef, commentData);

    // Update the top three narratives by type
    const narrativeRef = ref(db, `narratives/${narrativeId}`);
    const snapshot = await get(narrativeRef);
    const narrativeData = snapshot.val();
    if (narrativeData && narrativeData.type) {
        await updateTopThreeNarratives(narrativeData.type);
    }

    return { narrativeId, commentId: newCommentRef.key, ...commentData };
});

const narrativeSlice = createSlice({
    name: 'narratives',
    initialState: {
        narratives: [],
        topThreeNarratives: {},
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNarratives.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNarratives.fulfilled, (state, action) => {
                state.loading = false;
                state.narratives = action.payload;
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
    }
});

export default narrativeSlice.reducer;
