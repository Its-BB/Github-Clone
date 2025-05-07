import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
    getAllRepositories,
    getRepository,
    createRepository,
    updateRepository,
    deleteRepository,
    starRepository,
    unstarRepository,
    forkRepository,
} from '../store/slices/repositorySlice';
import { CreateRepositoryParams, UpdateRepositoryParams } from '../services/api/repository';

export const useRepository = () => {
    const dispatch = useAppDispatch();
    const { repositories, currentRepository, loading, error } = useAppSelector(
        (state) => state.repository
    );

    const handleGetAllRepositories = () => {
        return dispatch(getAllRepositories());
    };

    const handleGetRepository = (id: string) => {
        return dispatch(getRepository(id));
    };

    const handleCreateRepository = (data: CreateRepositoryParams) => {
        return dispatch(createRepository(data));
    };

    const handleUpdateRepository = (id: string, data: UpdateRepositoryParams) => {
        return dispatch(updateRepository({ id, data }));
    };

    const handleDeleteRepository = (id: string) => {
        return dispatch(deleteRepository(id));
    };

    const handleStarRepository = (id: string) => {
        return dispatch(starRepository(id));
    };

    const handleUnstarRepository = (id: string) => {
        return dispatch(unstarRepository(id));
    };

    const handleForkRepository = (id: string) => {
        return dispatch(forkRepository(id));
    };

    return {
        repositories,
        currentRepository,
        loading,
        error,
        getAllRepositories: handleGetAllRepositories,
        getRepository: handleGetRepository,
        createRepository: handleCreateRepository,
        updateRepository: handleUpdateRepository,
        deleteRepository: handleDeleteRepository,
        starRepository: handleStarRepository,
        unstarRepository: handleUnstarRepository,
        forkRepository: handleForkRepository,
    };
}; 