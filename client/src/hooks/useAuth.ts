import { useAppSelector, useAppDispatch } from '../store/hooks';
import { login, register, logout, getCurrentUser } from '../store/slices/authSlice';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { user, loading, error } = useAppSelector((state) => state.auth);

    const handleLogin = async (email: string, password: string) => {
        return dispatch(login({ email, password }));
    };

    const handleRegister = async (email: string, password: string, username: string) => {
        return dispatch(register({ email, password, username }));
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleGetCurrentUser = () => {
        dispatch(getCurrentUser());
    };

    return {
        user,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        getCurrentUser: handleGetCurrentUser,
        isAuthenticated: !!user,
    };
}; 