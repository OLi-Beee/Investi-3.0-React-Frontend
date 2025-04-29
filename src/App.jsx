import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { Typography, useMediaQuery, useTheme } from '@mui/material';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your routes/components here */}
    </ThemeProvider>
  );
}

function ResponsiveComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Typography 
      variant="body1"
      sx={{ 
        fontSize: isMobile ? '0.85rem' : '1rem',
        lineHeight: isMobile ? 1.4 : 1.7,
      }}
    >
      This text will be smaller on mobile devices
    </Typography>
  );
}

export default App;