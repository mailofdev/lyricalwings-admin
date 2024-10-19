import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updatePassword, 
  deleteUser, 
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { get, ref, remove, set, update } from 'firebase/database';
import { db } from '../common/firebase';

const encrypt = (data) => btoa(JSON.stringify(data));
const decrypt = (data) => {
  try {
    return JSON.parse(atob(data));
  } catch {
    return null;
  }
};

const loadUserFromStorage = () => {
  const encryptedUser = localStorage.getItem('user');
  if (encryptedUser) {
    return decrypt(encryptedUser);
  }
  return null;
};

const handleFirebaseError = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'User not found. Please check your email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'Email is already in use. Please choose another.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};



export const fetchUser = createAsyncThunk('users/fetchUser', async () => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([uid, userData]) => ({ uid, ...userData }));
  }
  return [];
});

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const userRef = ref(db, `users/${userCredential.user.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        username: userData.username,
      };

      localStorage.setItem('user', encrypt(user));
      return user;
    } catch (error) {
      return rejectWithValue(handleFirebaseError(error));
    }
  }
);

export const addNewUser = createAsyncThunk(
  'auth/addNewUser',
  async ({ email, password, username,  }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const userRef = ref(db, `users/${userCredential.user.uid}`);
      await set(userRef, { email, username,  });

      return { uid: userCredential.user.uid, email, username,  };
    } catch (error) {
      return rejectWithValue(handleFirebaseError(error));
    }
  }
);

export const updateUserInfo = createAsyncThunk(
  'auth/updateUserInfo',
  async ({ uid, username, email }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user && user.uid === uid) {
        await updateProfile(user, { displayName: username });
        
        if (user.email !== email) {
          // Note: Changing email requires re-authentication, which is not implemented here
          console.warn('Email update not implemented in this function');
        }
      }

      const userRef = ref(db, `users/${uid}`);
      await update(userRef, { username });

      return { uid, username, email };
    } catch (error) {
      return rejectWithValue(handleFirebaseError(error));
    }
  }
);

export const deleteExistingUser = createAsyncThunk(
  'auth/deleteExistingUser',
  async (uid, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user && user.uid === uid) {
        await deleteUser(user);
      } else {
        throw new Error('Cannot delete user. Make sure you have the correct permissions.');
      }

      const userRef = ref(db, `users/${uid}`);
      await remove(userRef);

      return uid;
    } catch (error) {
      return rejectWithValue(handleFirebaseError(error));
    }
  }
);

export const signoutUser = createAsyncThunk(
  'auth/signoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem('user');
    } catch (error) {
      return rejectWithValue(handleFirebaseError(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      return rejectWithValue(handleFirebaseError(error));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      } else {
        throw new Error('No user is currently logged in');
      }
    } catch (error) {
      return rejectWithValue(handleFirebaseError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadUserFromStorage(),
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLoading: (state) => {
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUser
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // Directly set the array of users
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addNewUser
      .addCase(addNewUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(addNewUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(addNewUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateUserInfo
      .addCase(updateUserInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.uid === action.payload.uid);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.user && state.user.uid === action.payload.uid) {
          state.user = { ...state.user, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteExistingUser
      .addCase(deleteExistingUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteExistingUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.uid !== action.payload);
        if (state.user && state.user.uid === action.payload) {
          state.user = null;
        }
        state.error = null;
      })
      .addCase(deleteExistingUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // signoutUser
      .addCase(signoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(signoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // changePassword
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearLoading } = authSlice.actions;

export default authSlice.reducer;