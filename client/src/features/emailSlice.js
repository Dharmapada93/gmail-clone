import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  emails: [],
  currentFolder: 'inbox',
  loading: false,
  error: null,
  page: 1,
  totalPages: 1,
};

const emailSlice = createSlice({
  name: 'emails',
  initialState,
  reducers: {
    setEmailsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    setEmailsSuccess: (state, action) => {
      state.loading = false;
      if (action.payload.append) {
        state.emails = [...state.emails, ...action.payload.data.emails];
      } else {
        state.emails = action.payload.data.emails;
      }
      state.page = action.payload.data.page;
      state.totalPages = action.payload.data.pages;
    },
    setEmailsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addEmail: (state, action) => {
      // Add email to list if we are in the correct folder (e.g. inbox or sent)
      state.emails.unshift(action.payload);
    },
    removeEmail: (state, action) => {
      state.emails = state.emails.filter(e => e._id !== action.payload);
    },
    setCurrentFolder: (state, action) => {
      state.currentFolder = action.payload;
    }
  },
});

export const { setEmailsStart, setEmailsSuccess, setEmailsFailure, addEmail, removeEmail, setCurrentFolder } = emailSlice.actions;
export default emailSlice.reducer;
