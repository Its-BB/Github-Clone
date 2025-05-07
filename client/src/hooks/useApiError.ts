import { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useAppSelector } from '../store/hooks';

export const useApiError = () => {
    const { enqueueSnackbar } = useSnackbar();
    const authError = useAppSelector((state) => state.auth.error);
    const repositoryError = useAppSelector((state) => state.repository.error);
    const issueError = useAppSelector((state) => state.issue.error);

    useEffect(() => {
        if (authError) {
            enqueueSnackbar(authError, { variant: 'error' });
        }
    }, [authError, enqueueSnackbar]);

    useEffect(() => {
        if (repositoryError) {
            enqueueSnackbar(repositoryError, { variant: 'error' });
        }
    }, [repositoryError, enqueueSnackbar]);

    useEffect(() => {
        if (issueError) {
            enqueueSnackbar(issueError, { variant: 'error' });
        }
    }, [issueError, enqueueSnackbar]);
}; 