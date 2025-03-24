import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 'bold',
          textTransform: 'capitalize'
        }
      }
    }
  },
});

export default theme;