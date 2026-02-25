import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { addClient } from "../../../api/gym-clients.api";
import type { ClientDTO } from "../../../api/gym-clients.api";
import ClientForm from "./components/ClientForm"

const AddClient: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: Partial<ClientDTO>) => {
        try {
            setIsLoading(true);
            const response = await addClient(data);
            if (response.status == "success") {
                toast.success('Client added successfully');
            } else {
                toast.error(response.message || 'Failed to add client');
                return
            }
            navigate('/gym/clients');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add client');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClientForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                title="Add New Client"
            />
        </div>
    );
};

export default AddClient;
