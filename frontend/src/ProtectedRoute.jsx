import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children}) => {

    const { isAuthorised } = useSelector(state => state.user)

    if (!isAuthorised) {
        return <Navigate to="/auth" />
    }

    return children;
};

export default ProtectedRoute;