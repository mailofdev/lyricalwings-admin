import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, get, remove, set } from 'firebase/database';
import { getAuth, deleteUser as firebaseDeleteUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth } from '../Config/firebase';

const mapFirebaseUserToPlainObject = (firebaseUser) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
});

export const fetchUsers = createAsyncThunk('usersData/fetchusersData', async (_, { rejectWithValue }) => {
  try {
    const usersRef = ref(db, 'usersData');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      return Object.entries(snapshot.val()).map(([uid, userData]) => ({ uid, ...userData }));
    }
    return [];
  } catch (error) {
    return rejectWithValue('Failed to fetch users. Please try again.');
  }
});

export const deleteUser = createAsyncThunk('usersData/deleteUser', async (uid, { rejectWithValue }) => {
  const auth = getAuth();
  try {
    const user = auth.currentUser;
    if (user) {
      await firebaseDeleteUser(user);
      const userRef = ref(db, `usersData/${uid}`);
      await remove(userRef);
      return uid;
    } else {
      throw new Error('No user is currently logged in');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return rejectWithValue('Failed to delete user. Please try again.');
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async ({ authEmail, authPassword }, { rejectWithValue }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
    return mapFirebaseUserToPlainObject(userCredential.user);
  } catch (error) {
    return rejectWithValue('Invalid email or password. Please try again.');
  }
});

export const signupUser = createAsyncThunk('auth/signupUser', async ({ authEmail, authPassword, authUsername, authBirthday, authCity, authGender }, { rejectWithValue }) => {
  try {
    // Check password length
    if (authPassword.length < 6) {
      throw new Error('Password should be at least 6 characters long');
    }

    // Format the date
    const formattedBirthday = new Date(authBirthday).toISOString().split('T')[0]; // This will give 'YYYY-MM-DD'

    const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
    await updateProfile(userCredential.user, { displayName: authUsername }); 

    const userRef = ref(db, `usersData/${userCredential.user.uid}`);
    await set(userRef, {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: authUsername,
        birthday: formattedBirthday,
        city: authCity,
        gender: authGender,
        role: 'user'
    });

    return mapFirebaseUserToPlainObject(userCredential.user);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      return rejectWithValue('Email is already in use. Please use a different email.');
    }
    return rejectWithValue(error.message || 'Failed to create account. Please try again.');
  }
});

export const signoutUser = createAsyncThunk('auth/signoutUser', async (_, { rejectWithValue }) => {
  try {
    await signOut(auth);
  } catch (error) {
    return rejectWithValue('Failed to sign out. Please try again.');
  }
});

export const googleSignIn = createAsyncThunk('auth/googleSignIn', async (_, { rejectWithValue }) => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userRef = ref(db, `usersData/${user.uid}`);
    await set(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'user'
    });

    return mapFirebaseUserToPlainObject(user);
  } catch (error) {
    return rejectWithValue('Failed to sign in with Google. Please try again.');
  }
});

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState: {
    users: {
      data: [],
      status: 'idle',
      error: null,
    },
    auth: {
      user: JSON.parse(localStorage.getItem('user')) || null,
      status: 'idle',
      error: null,
    },
  },
  reducers: {
    clearError: (state) => {
      state.auth.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.users.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.status = 'succeeded';
        state.users.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.status = 'failed';
        state.users.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.users.status = 'loading';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users.status = 'succeeded';
        state.users.data = state.users.data.filter(user => user.uid !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.users.status = 'failed';
        state.users.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.auth.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.auth.status = 'succeeded';
        state.auth.user = action.payload;
        state.auth.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.auth.status = 'failed';
        state.auth.error = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.auth.status = 'loading';
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.auth.status = 'succeeded';
        state.auth.user = action.payload;
        state.auth.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.auth.status = 'failed';
        state.auth.error = action.payload;
      })
      .addCase(signoutUser.fulfilled, (state) => {
        state.auth.user = null;
        state.auth.error = null;
        localStorage.removeItem('user');
      })
      .addCase(signoutUser.rejected, (state, action) => {
        state.auth.error = action.payload;
      })
      .addCase(googleSignIn.pending, (state) => {
        state.auth.status = 'loading';
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.auth.status = 'succeeded';
        state.auth.user = action.payload;
        state.auth.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.auth.status = 'failed';
        state.auth.error = action.payload;
      });
  },
});

export const { clearError } = userAuthSlice.actions;
export default userAuthSlice.reducer;