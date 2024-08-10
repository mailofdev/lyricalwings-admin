import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage, ref as storageRef, uploadBytes, getDownloadURL, get, ref, push, set, remove } from '../Config/firebase';

// Async thunks for poems
export const fetchPoems = createAsyncThunk('content/fetchPoems', async () => {
  const AllPoemsRef = ref(db, 'AllPoems');
  const snapshot = await get(AllPoemsRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    const poemsArray = Object.values(data).reverse();
    return { type: 'poems', items: poemsArray, totalRecords: poemsArray.length };
  }
  console.log('No Poems Found');
  return { type: 'poems', items: [], totalRecords: 0 };
});

export const postPoem = createAsyncThunk('content/postPoem', async (poemData) => {
  const { title, subTitle, content, type, fontColor, selectedFile } = poemData;
  const isShowDangerouslySetInnerHTML = true;
  const isPoem = true;
  const AllPoemsRef = ref(db, 'AllPoems');
  const newId = push(AllPoemsRef).key;
  const typeToColorMap = {
    sadness: '#cce5ff',
    happiness: '#e2f0cb',
    anger: '#ffd6cc',
    fear: '#ffebcc',
    disgust: '#f0f0f0',
    surprise: '#f5e6ff',
  };
  const cardColor = typeToColorMap[type];
  const newPoemData = {
    id: newId,
    isPoem,
    type,
    title,
    subTitle,
    isShowDangerouslySetInnerHTML,
    content,
    fontColor,
    cardColor,
    likes: {},
    comments: {},
    timestamp: Date.now(),
    fileName: selectedFile ? selectedFile.name : null,
  };

  if (selectedFile) {
    const fileRef = storageRef(storage, `poemImages/${newId}/${selectedFile.name}`);
    await uploadBytes(fileRef, selectedFile);
    const downloadUrl = await getDownloadURL(fileRef);
    newPoemData.fileUrl = downloadUrl;
  }

  await set(ref(db, `AllPoems/${newId}`), newPoemData);
  return { type: 'poems', item: newPoemData };
});

export const updatePoem = createAsyncThunk('content/updatePoem', async (updatedPoem) => {
  const poemRef = ref(db, `AllPoems/${updatedPoem.id}`);
  await set(poemRef, updatedPoem);
  return updatedPoem;
});

export const deletePoem = createAsyncThunk('content/deletePoem', async (poemId) => {
  const poemRef = ref(db, `AllPoems/${poemId}`);
  await remove(poemRef);
  return poemId;
});

// Async thunks for stories and novels
export const fetchStoryAndNovel = createAsyncThunk('content/fetchStoryAndNovel', async () => {
  const storyAndNovelRef = ref(db, 'storyAndNovel');
  const snapshot = await get(storyAndNovelRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    const storyAndNovelArray = Object.values(data).reverse();
    return { type: 'storyAndNovel', items: storyAndNovelArray, totalRecords: storyAndNovelArray.length };
  }
  console.log('No Stories and Novels Found');
  return { type: 'storyAndNovel', items: [], totalRecords: 0 };
});

export const postStoryAndNovel = createAsyncThunk('content/postStoryAndNovel', async (storyAndNovelData) => {
  const { title, content, type } = storyAndNovelData;
  const isStoryAndNovel = true;
  const storyAndNovelRef = ref(db, 'storyAndNovel');
  const newId = push(storyAndNovelRef).key;
  const typeToColorMap = {
    story: '#e2f0cb',
    novel: '#f5e6ff',
  };
  const cardColor = typeToColorMap[type];
  const newStoryAndNovelData = {
    id: newId,
    type,
    isStoryAndNovel,
    title,
    content,
    cardColor,
    likes: {},
    comments: {},
    timestamp: Date.now(),
  };

  await set(ref(db, `storyAndNovel/${newId}`), newStoryAndNovelData);
  return { type: 'storyAndNovel', item: newStoryAndNovelData };
});

export const updateStoryAndNovel = createAsyncThunk('content/updateStoryAndNovel', async (updatedStoryAndNovel) => {
  const storyAndNovelRef = ref(db, `storyAndNovel/${updatedStoryAndNovel.id}`);
  await set(storyAndNovelRef, updatedStoryAndNovel);
  return updatedStoryAndNovel;
});

export const deleteStoryAndNovel = createAsyncThunk('content/deleteStoryAndNovel', async (storyAndNovelId) => {
  const storyAndNovelRef = ref(db, `storyAndNovel/${storyAndNovelId}`);
  await remove(storyAndNovelRef);
  return storyAndNovelId;
});

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    poems: [],
    storyAndNovel: [],
    status: 'idle',
    error: null,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPoems.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchPoems.fulfilled, (state, action) => {
        if (action.payload.type === 'poems') {
          state.status = 'succeeded';
          state.poems = action.payload.items;
          state.loading = false;
        }
      })
      .addCase(fetchPoems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(postPoem.fulfilled, (state, action) => {
        if (action.payload.type === 'poems') {
          state.poems.unshift(action.payload.item);
          state.loading = false;
        }
      })
      .addCase(postPoem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePoem.fulfilled, (state, action) => {
        state.poems = state.poems.map(poem =>
          poem.id === action.payload.id ? action.payload : poem
        );
        state.loading = false;
      })
      .addCase(updatePoem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePoem.fulfilled, (state, action) => {
        state.poems = state.poems.filter(poem => poem.id !== action.payload);
        state.loading = false;
      })
      .addCase(deletePoem.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStoryAndNovel.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchStoryAndNovel.fulfilled, (state, action) => {
        if (action.payload.type === 'storyAndNovel') {
          state.status = 'succeeded';
          state.storyAndNovel = action.payload.items;
          state.loading = false;
        }
      })
      .addCase(fetchStoryAndNovel.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(postStoryAndNovel.fulfilled, (state, action) => {
        if (action.payload.type === 'storyAndNovel') {
          state.storyAndNovel.unshift(action.payload.item);
          state.loading = false;
        }
      })
      .addCase(postStoryAndNovel.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStoryAndNovel.fulfilled, (state, action) => {
        state.storyAndNovel = state.storyAndNovel.map(item =>
          item.id === action.payload.id ? action.payload : item
        );
        state.loading = false;
      })
      .addCase(updateStoryAndNovel.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStoryAndNovel.fulfilled, (state, action) => {
        state.storyAndNovel = state.storyAndNovel.filter(item => item.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteStoryAndNovel.pending, (state) => {
        state.loading = true;
      });
  },
});

export default contentSlice.reducer;
