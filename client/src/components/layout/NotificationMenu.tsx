import React from 'react';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
    IconButton,
} from '@mui/material';
import {
    Notifications,
    Star,
    CallMerge,
    BugReport,
    Comment,
    Close,
} from '@mui/icons-material';

interface Notification {
    id: string;
    type: 'star' | 'pull_request' | 'issue' | 'comment';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

interface NotificationMenuProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
    anchorEl,
    onClose,
}) => {
    // This would typically come from Redux state
    const notifications: Notification[] = [
        {
            id: '1',
            type: 'star',
            title: 'New Star',
            message: 'User123 starred your repository',
            time: '2 hours ago',
            read: false,
        },
        {
            id: '2',
            type: 'pull_request',
            title: 'Pull Request',
            message: 'User456 opened a pull request',
            time: '5 hours ago',
            read: true,
        },
        {
            id: '3',
            type: 'issue',
            title: 'New Issue',
            message: 'User789 opened an issue',
            time: '1 day ago',
            read: true,
        },
    ];

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'star':
                return <Star />;
            case 'pull_request':
                return <CallMerge />;
            case 'issue':
                return <BugReport />;
            case 'comment':
                return <Comment />;
            default:
                return <Notifications />;
        }
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            PaperProps={{
                sx: { width: 360, maxHeight: 480 },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Notifications
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>
            <Divider />
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <MenuItem
                        key={notification.id}
                        sx={{
                            py: 1.5,
                            px: 2,
                            backgroundColor: notification.read
                                ? 'transparent'
                                : 'action.hover',
                        }}
                    >
                        <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
                        <ListItemText
                            primary={notification.title}
                            secondary={
                                <React.Fragment>
                                    <Typography
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {notification.message}
                                    </Typography>
                                    <Typography
                                        component="span"
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'block' }}
                                    >
                                        {notification.time}
                                    </Typography>
                                </React.Fragment>
                            }
                        />
                    </MenuItem>
                ))
            ) : (
                <MenuItem disabled>
                    <ListItemText
                        primary="No notifications"
                        sx={{ textAlign: 'center', py: 2 }}
                    />
                </MenuItem>
            )}
        </Menu>
    );
};

export default NotificationMenu; 