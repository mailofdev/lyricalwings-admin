import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, get, remove, set } from 'firebase/database';
import { getAuth, deleteUser as firebaseDeleteUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { db, auth } from '../Config/firebase';

// Helper function to map Firebase User object to plain object
const mapFirebaseUserToPlainObject = (firebaseUser) => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
  };
};

// Async thunks

// Fetch users from Firebase Realtime Database
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([uid, userData]) => ({ uid, ...userData }));
  }
  return [];
});


// Delete a user from Firebase Authentication and Realtime Database
export const deleteUser = createAsyncThunk('users/deleteUser', async (uid, { rejectWithValue }) => {
  const auth = getAuth();
  try {
    const user = auth.currentUser;
    if (user) {
      // Delete user from Authentication
      await firebaseDeleteUser(user);

      // Delete user from Realtime Database
      const userRef = ref(db, `users/${uid}`);
      await remove(userRef);

      return uid;
    } else {
      throw new Error('No user is currently logged in');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return rejectWithValue(error.message);
  }
});


// Login user
export const loginUser = createAsyncThunk('auth/loginUser', async ({ authEmail, authPassword }) => {
  const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
  return mapFirebaseUserToPlainObject(userCredential.user);
});

// Signup user
export const signupUser = createAsyncThunk('auth/signupUser', async ({ authEmail, authPassword, authUsername, authBirthday, authCity, authGender }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
  await updateProfile(userCredential.user, { displayName: authUsername }); 

  // Save user data to Realtime Database
  const userRef = ref(db, `users/${userCredential.user.uid}`);
  await set(userRef, {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: authUsername,
      birthday: authBirthday,
      city: authCity,
      gender: authGender,
      role: 'admin'
  });

  return mapFirebaseUserToPlainObject(userCredential.user);
});


// Signout user
export const signoutUser = createAsyncThunk('auth/signoutUser', async () => {
  await signOut(auth);
});

// Combined Slice
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.users.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.status = 'succeeded';
        state.users.data = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.status = 'failed';
        state.users.error = action.error.message;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.users.status = 'loading';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const uid = action.payload;
        state.users.status = 'succeeded';
        state.users.data = state.users.data.filter(user => user.uid !== uid);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.users.status = 'failed';
        state.users.error = action.payload || action.error.message;
      })
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.auth.status = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.auth.status = 'succeeded';
        state.auth.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.auth.status = 'failed';
        state.auth.error = action.error.message;
      })
      // Signup user
      .addCase(signupUser.pending, (state) => {
        state.auth.status = 'loading';
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.auth.status = 'succeeded';
        state.auth.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.auth.status = 'failed';
        state.auth.error = action.error.message;
      })
      // Signout user
      .addCase(signoutUser.fulfilled, (state) => {
        state.auth.user = null;
        localStorage.removeItem('user');
      });
  },
});

export default userAuthSlice.reducer;
