import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ViewClient: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to the profile page (view mode by default)
        navigate(`/gym/clients/${id}`);
    }, [id, navigate]);

    return null;
};

export default ViewClient;