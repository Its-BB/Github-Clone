import { useAppSelector } from '../store/hooks';

export const useLoading = () => {
    const authLoading = useAppSelector((state) => state.auth.loading);
    const repositoryLoading = useAppSelector((state) => state.repository.loading);
    const issueLoading = useAppSelector((state) => state.issue.loading);

    return {
        isLoading: authLoading || repositoryLoading || issueLoading,
        authLoading,
        repositoryLoading,
        issueLoading,
    };
}; 