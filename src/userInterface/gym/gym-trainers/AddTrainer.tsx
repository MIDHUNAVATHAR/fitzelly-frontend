import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import TrainerForm from "./components/TrainerForm";
import { addTrainer } from "../../../api/gym-trainers.api";
import type { Trainer } from "../../../api/gym-trainers.api";
import { isAxiosError } from 'axios';

const AddTrainer: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: Partial<Trainer>) => {
        try {
            setIsLoading(true);
            await addTrainer(data);
            toast.success('Trainer added successfully');
            navigate('/gym/trainers');
        } catch (error: unknown) {
            if(isAxiosError(error)){
            toast.error(error.response?.data?.message || 'Failed to add trainer');
            }
            
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TrainerForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                title="Add New Trainer"
            />
        </div>
    );
};

export default AddTrainer;
