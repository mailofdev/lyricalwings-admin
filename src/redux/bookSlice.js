import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { get, ref, push, set, remove, serverTimestamp } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../common/firebase';


const uploadImage = async (file) => {
    const filename = `${Date.now()}_${file.name}`;
    const imageRef = storageRef(storage, `book_images/${filename}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  };
  

  
// Async thunk for fetching book from Firebase
export const fetchbook = createAsyncThunk('book/fetchbook', async () => {
    const bookRef = ref(db, 'book');
    const snapshot = await get(bookRef);
    const book = snapshot.val() || {};
    return Object.keys(book).map(key => ({ 
        id: key, 
        ...book[key],
        createdAt: serverTimestamp(), 
        lastUpdated: Number(book[key].lastUpdated) || Date.now()
    }));
});

// Async thunk for adding a new book
export const addbook = createAsyncThunk('book/addbook', async (bookData) => {
    const timestamp = Date.now();
    let updatedBookData = {
         ...bookData,
         createdAt: timestamp,
         lastUpdated: timestamp,
         likes: {},
         comments: {}
        };
    
    if (bookData.bookImage instanceof File) {
      const imageUrl = await uploadImage(bookData.bookImage);
      updatedBookData.bookImage = imageUrl;
    }
  
    const bookRef = ref(db, 'book');
    const newbookRef = push(bookRef);
    await set(newbookRef, updatedBookData);
    return { id: newbookRef.key, ...updatedBookData };
  });

// Async thunk for updating an existing book
export const updatebook = createAsyncThunk('book/updatebook', async ({ id, bookData }) => {
    let updatedBookData = { 
        ...bookData,
        lastUpdated: Date.now()
     };
  
    if (bookData.bookImage instanceof File) {
      const imageUrl = await uploadImage(bookData.bookImage);
      updatedBookData.bookImage = imageUrl;
    }
  
    const bookRef = ref(db, `book/${id}`);
    await set(bookRef, updatedBookData);
    return { id, ...updatedBookData };
  });

  export const selectAllBooks = state => state.book.book;

  export const selectLatestBooks = createSelector(
    [selectAllBooks],
    (book) => {
        return [...book]
            .sort((a, b) => {
                const likesA = a.likes ? Object.keys(a.likes).length : 0;
                const likesB = b.likes ? Object.keys(b.likes).length : 0;
                return likesB - likesA;
            })
            .slice(0, 3);
    }
);

export const selectMostLikedBooks = createSelector(
    [selectAllBooks],
    (book) => {
        return [...book]
            .sort((a, b) => {
                const likesA = a.likes ? Object.keys(a.likes).length : 0;
                const likesB = b.likes ? Object.keys(b.likes).length : 0;
                return likesB - likesA;
            })
            .slice(0, 3);
    }
);



// Async thunk for deleting a book
export const deletebook = createAsyncThunk('book/deletebook', async (id) => {
    const bookRef = ref(db, `book/${id}`);
    await remove(bookRef);
    return id;
});

// New async thunk for adding a like to a book
export const addLike = createAsyncThunk('book/addLike', async ({ bookId, userName }) => {
    const likeRef = ref(db, `book/${bookId}/likes/${userName}`);
    await set(likeRef, true);
    return { bookId, userName };
});

// New async thunk for removing a like from a book
export const removeLike = createAsyncThunk('book/removeLike', async ({ bookId, userName }) => {
    const likeRef = ref(db, `book/${bookId}/likes/${userName}`);
    await remove(likeRef);
    return { bookId, userName };
});

// New async thunk for adding a comment to a book
export const addComment = createAsyncThunk('book/addComment', async ({ bookId, userName, comment }) => {
    const commentsRef = ref(db, `book/${bookId}/comments`);
    const newCommentRef = push(commentsRef);
    const commentData = {
        userName,
        text: comment,
        timestamp: Date.now()
    };
    await set(newCommentRef, commentData);
    return { bookId, commentId: newCommentRef.key, ...commentData };
});


const bookSlice = createSlice({
    name: 'book',
    initialState: {
        book: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchbook.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchbook.fulfilled, (state, action) => {
                state.loading = false;
                state.book = action.payload;
            })
            .addCase(fetchbook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addbook.fulfilled, (state, action) => {
                state.book.push(action.payload);
            })
            .addCase(updatebook.fulfilled, (state, action) => {
                const index = state.book.findIndex(book => book.id === action.payload.id);
                if (index !== -1) {
                    state.book[index] = action.payload;
                }
            })
            .addCase(deletebook.fulfilled, (state, action) => {
                state.book = state.book.filter(book => book.id !== action.payload);
            })
            .addCase(addLike.fulfilled, (state, action) => {
                const { bookId, userName } = action.payload;
                const book = state.book.find(p => p.id === bookId);
                if (book) {
                    if (!book.likes) book.likes = {};
                    book.likes[userName] = true;
                }
            })
            .addCase(removeLike.fulfilled, (state, action) => {
                const { bookId, userName } = action.payload;
                const book = state.book.find(p => p.id === bookId);
                if (book && book.likes) {
                    delete book.likes[userName];
                }
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const { bookId, commentId, ...commentData } = action.payload;
                const book = state.book.find(p => p.id === bookId);
                if (book) {
                    if (!book.comments) book.comments = {};
                    book.comments[commentId] = commentData;
                }
            });
    },
});

export default bookSlice.reducer;