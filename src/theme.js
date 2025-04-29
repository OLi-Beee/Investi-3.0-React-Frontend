import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { green, teal, grey } from '@mui/material/colors';

// Create base theme
let theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: green[500],
    },
    secondary: {
      main: teal[400],
    },
    background: {
      default: '#0d0d0d',
      paper: 'rgba(20, 30, 20, 0.4)',
    },
    text: {
      primary: '#ffffff',
      secondary: grey[300],
    },
  },
  typography: {
    // Base font sizes (will be scaled down on mobile)
    h1: {
      fontSize: '2.5rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.75rem',
    },
    h4: {
      fontSize: '1.5rem',
    },
    h5: {
      fontSize: '1.25rem',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.85rem',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme, { 
  breakpoints: ['sm', 'md', 'lg'],
  factor: 0.5 // This controls how much the font sizes decrease on smaller screens
});

export default theme;