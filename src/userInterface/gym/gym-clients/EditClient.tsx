import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { updateClient, getClientById } from "../../../api/gym-clients.api";
import type { Client } from "../../../api/gym-clients.api";
import ClientForm from './components/ClientForm';
import { Loader2 } from 'lucide-react';

const EditClient: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [clientData, setClientData] = useState<Partial<Client> | undefined>(undefined);

    useEffect(() => {
        const fetchClient = async () => {
            if (!id) return;
            try {
                const data = await getClientById(id);
                setClientData(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load client details');
                navigate('/gym/clients');
            } finally {
                setIsFetching(false);
            }
        };
        fetchClient();
    }, [id, navigate]);

    const handleSubmit = async (data: Partial<Client>) => {
        if (!id) return;
        try {
            setIsLoading(true);
            await updateClient(id, data);
            toast.success('Client updated successfully');
            navigate('/gym/clients');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update client');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ClientForm
                initialData={clientData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                title="Edit Client"
            />
        </div>
    );
};

export default EditClient;
