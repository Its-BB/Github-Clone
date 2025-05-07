import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Box,
    Typography,
    Avatar,
} from '@mui/material';
import {
    Dashboard,
    Code,
    BugReport,
    CallMerge,
    Star,
    People,
    Settings,
    Add,
} from '@mui/icons-material';
import { RootState } from '../../store';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <Dashboard />,
            path: '/',
        },
        {
            text: 'Repositories',
            icon: <Code />,
            path: '/repositories',
        },
        {
            text: 'Issues',
            icon: <BugReport />,
            path: '/issues',
        },
        {
            text: 'Pull Requests',
            icon: <CallMerge />,
            path: '/pulls',
        },
        {
            text: 'Stars',
            icon: <Star />,
            path: '/stars',
        },
        {
            text: 'People',
            icon: <People />,
            path: '/people',
        },
        {
            text: 'Settings',
            icon: <Settings />,
            path: '/settings',
        },
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {user && (
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={user.avatar} alt={user.username} />
                    <Box>
                        <Typography variant="subtitle1">{user.username}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Box>
            )}
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/new')}>
                        <ListItemIcon>
                            <Add />
                        </ListItemIcon>
                        <ListItemText primary="New Repository" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
};

export default Sidebar; 