import { useAuthCheck } from "../../hooks/useAuthCheck";

const AuthProvider = ({ children }) => {
    useAuthCheck();
    return <>{children}</>;
};
export default AuthProvider;