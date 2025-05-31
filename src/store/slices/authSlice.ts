import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { auth } from '../../config/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async ({ email, password }: { email: string; password: string }) => {
    // Test account check
    if (email === 'admin' && password === 'admin') {
      // Create a mock UserCredential instead of User directly
      const mockUser = {
        user: {
          uid: 'test-admin-uid',
          email: 'admin@travelgo.com',
          displayName: 'Test Admin',
          emailVerified: true,
          isAnonymous: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString(),
          },
          providerData: [
            {
              uid: 'test-admin-uid', // Typically matches the main uid for password auth
              email: 'admin@travelgo.com',
              displayName: 'Test Admin',
              phoneNumber: null,
              photoURL: null,
              providerId: 'password', // Important: indicates email/password authentication
            },
          ],
          refreshToken: 'mock-refresh-token',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => 'mock-token',
          getIdTokenResult: async () => ({
            token: 'mock-token',
            signInProvider: 'password',
            claims: {},
            authTime: new Date().toISOString(),
            issuedAtTime: new Date().toISOString(),
            expirationTime: new Date(Date.now() + 3600000).toISOString(),
          }),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          photoURL: null,
          providerId: 'password'
        } as unknown as User
      } as UserCredential;
      
      return mockUser.user;
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }
);

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    await firebaseSignOut(auth);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state: AuthState, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearError: (state: AuthState) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In with Email
      .addCase(signInWithEmail.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signInWithEmail.rejected, (state: AuthState, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      // Sign In with Google
      .addCase(signInWithGoogle.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signInWithGoogle.rejected, (state: AuthState, action) => {
        state.loading = false;
        state.error = action.error.message || 'Google sign in failed';
      })
      // Sign Up
      .addCase(signUp.pending, (state: AuthState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state: AuthState, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state: AuthState, action) => {
        state.loading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state: AuthState) => {
        state.user = null;
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer; 