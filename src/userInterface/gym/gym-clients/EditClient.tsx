import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditClient: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to the profile page with edit mode enabled
        navigate(`/gym/clients/${id}`, { state: { enableEditing: true } });
    }, [id, navigate]);

    return null;
};

export default EditClient;