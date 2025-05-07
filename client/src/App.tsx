import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';

// Layout components
import Layout from './components/layout/Layout';

// Page components
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/user/Profile';
import Repository from './pages/repository/Repository';
import CreateRepository from './pages/repository/CreateRepository';
import Issue from './pages/issue/Issue';
import PullRequest from './pages/pullRequest/PullRequest';
import NotFound from './pages/NotFound';

// Auth guard
import PrivateRoute from './components/auth/PrivateRoute';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/:username" element={<Profile />} />
                            <Route path="/:owner/:repo" element={<Repository />} />
                            <Route
                                path="/new"
                                element={
                                    <PrivateRoute>
                                        <CreateRepository />
                                    </PrivateRoute>
                                }
                            />
                            <Route path="/:owner/:repo/issues/:number" element={<Issue />} />
                            <Route path="/:owner/:repo/pull/:number" element={<PullRequest />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Layout>
                </Router>
            </ThemeProvider>
        </Provider>
    );
};

export default App; 