export interface TrainerPayout {
    id: string;
    gymId: string;
    trainerId: string;
    trainerName?: string;
    amount: number;
    notes: string | null;
    date: string;
}
