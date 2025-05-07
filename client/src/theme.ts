import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#24292e',
            light: '#444d56',
            dark: '#1b1f23',
        },
        secondary: {
            main: '#2ea44f',
            light: '#2c974b',
            dark: '#2a8a47',
        },
        background: {
            default: '#ffffff',
            paper: '#f6f8fa',
        },
        text: {
            primary: '#24292e',
            secondary: '#586069',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Helvetica',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
        ].join(','),
        h1: {
            fontSize: '2rem',
            fontWeight: 600,
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '1.25rem',
            fontWeight: 600,
        },
        h4: {
            fontSize: '1rem',
            fontWeight: 600,
        },
        body1: {
            fontSize: '0.875rem',
        },
        body2: {
            fontSize: '0.75rem',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#24292e',
                },
            },
        },
    },
});

export default theme; 