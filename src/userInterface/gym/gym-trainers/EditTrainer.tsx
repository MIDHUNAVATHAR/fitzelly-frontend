import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { updateTrainer, getTrainerById } from  "../../../api/gym-trainers.api";
import type { Trainer } from "../../../api/gym-trainers.api";
import TrainerForm from "./components/TrainerForm";
import { Loader2 } from 'lucide-react';

const EditTrainer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [trainerData, setTrainerData] = useState<Partial<Trainer> | undefined>(undefined);

    useEffect(() => {
        const fetchTrainer = async () => {
            if (!id) return;
            try {
                const data = await getTrainerById(id);
                setTrainerData(data);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load trainer details');
                navigate('/gym/trainers');
            } finally {
                setIsFetching(false);
            }
        };
        fetchTrainer();
    }, [id, navigate]);

    const handleSubmit = async (data: Partial<Trainer>) => {
        if (!id) return;
        try {
            setIsLoading(true);
            await updateTrainer(id, data);
            toast.success('Trainer updated successfully');
            navigate('/gym/trainers');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update trainer');
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
            <TrainerForm
                initialData={trainerData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                title="Edit Trainer"
            />
        </div>
    );
};

export default EditTrainer;
