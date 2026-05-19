export interface IExercise {
    id: string;
    idInLibrary?: string;
    name: string;
    instructions?: string;
    videoUrl?: string;
    reps: string;
    sets: string;
}

export interface IDayPlan {
    day: string;
    exercises: IExercise[];
}

export interface IWorkoutPlan {
    id?: string;
    clientId: string;
    trainerId: string;
    gymId: string;
    weekStartDate: string;
    weeklyPlan: IDayPlan[];
    notes?: string;
}

export interface IWorkoutProgress {
    date: string;
    completedExercises: string[];
}
