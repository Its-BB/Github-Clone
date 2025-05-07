import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Breadcrumbs,
    Link,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    SelectChangeEvent,
} from '@mui/material';
import {
    Folder as FolderIcon,
    InsertDriveFile as FileIcon,
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { repositoryAPI } from '../services/api';

interface FileEntry {
    name: string;
    path: string;
    type: 'file' | 'dir';
    size?: number;
    sha: string;
    url: string;
    downloadUrl?: string;
}

interface FileBrowserProps {
    owner: string;
    repo: string;
    defaultBranch: string;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ owner, repo, defaultBranch }) => {
    const [path, setPath] = useState<string>('');
    const [contents, setContents] = useState<FileEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string>(defaultBranch);
    const [branches, setBranches] = useState<string[]>([]);

    useEffect(() => {
        fetchBranches();
        fetchContents();
    }, [owner, repo, selectedBranch]);

    const fetchBranches = async () => {
        try {
            const response = await repositoryAPI.getBranches(owner, repo);
            setBranches(response.data.map((branch: any) => branch.name));
        } catch (err: any) {
            setError(err.message || 'Failed to fetch branches');
        }
    };

    const fetchContents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await repositoryAPI.getContents(owner, repo, path, selectedBranch);
            setContents(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch contents');
        } finally {
            setLoading(false);
        }
    };

    const handlePathClick = (newPath: string) => {
        setPath(newPath);
    };

    const handleBackClick = () => {
        const parentPath = path.split('/').slice(0, -1).join('/');
        setPath(parentPath);
    };

    const handleBranchChange = (event: SelectChangeEvent<string>) => {
        setSelectedBranch(event.target.value);
    };

    const handleRefresh = () => {
        fetchContents();
    };

    const renderBreadcrumbs = () => {
        const parts = path.split('/').filter(Boolean);
        const breadcrumbs = [
            <Link
                key="root"
                component="button"
                variant="body1"
                onClick={() => handlePathClick('')}
                sx={{ cursor: 'pointer' }}
            >
                Root
            </Link>,
        ];

        let currentPath = '';
        parts.forEach((part) => {
            currentPath += `/${part}`;
            breadcrumbs.push(
                <Link
                    key={currentPath}
                    component="button"
                    variant="body1"
                    onClick={() => handlePathClick(currentPath)}
                    sx={{ cursor: 'pointer' }}
                >
                    {part}
                </Link>
            );
        });

        return <Breadcrumbs>{breadcrumbs}</Breadcrumbs>;
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControl sx={{ minWidth: 200, mr: 2 }}>
                    <InputLabel>Branch</InputLabel>
                    <Select
                        value={selectedBranch}
                        onChange={handleBranchChange}
                        size="small"
                        label="Branch"
                    >
                        {branches.map((branch) => (
                            <MenuItem key={branch} value={branch}>
                                {branch}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <IconButton onClick={handleRefresh} size="small">
                    <RefreshIcon />
                </IconButton>
            </Box>

            {path && (
                <Box sx={{ mb: 2 }}>
                    <IconButton onClick={handleBackClick} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    {renderBreadcrumbs()}
                </Box>
            )}

            <List>
                {contents.map((item) => (
                    <ListItem
                        key={item.path}
                        button
                        onClick={() => handlePathClick(item.path)}
                    >
                        <ListItemIcon>
                            {item.type === 'dir' ? <FolderIcon /> : <FileIcon />}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.name}
                            secondary={
                                item.type === 'file'
                                    ? `${(item.size || 0).toLocaleString()} bytes`
                                    : 'Directory'
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default FileBrowser; 