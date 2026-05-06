import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTheme: localStorage.getItem('theme') || 'default',
  customTheme: JSON.parse(localStorage.getItem('customTheme')) || null,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.activeTheme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setCustomTheme: (state, action) => {
      state.customTheme = action.payload;
      state.activeTheme = 'custom';
      localStorage.setItem('customTheme', JSON.stringify(action.payload));
      localStorage.setItem('theme', 'custom');
    }
  },
});

export const { setTheme, setCustomTheme } = themeSlice.actions;
export default themeSlice.reducer;
