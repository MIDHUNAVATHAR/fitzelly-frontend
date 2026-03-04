import { useCallback } from 'react';

export const useDateFormat = () => {
    // Shows like "8 Sept 2000"
    const formatToShortMonth = useCallback((dateString?: string | Date | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }, []);

    // Shows like "09/12/2000"
    const formatToGB = useCallback((dateString?: string | Date | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }, []);

    // Parses implicitly to YYYY-MM-DD for native input date
    const formatToYYYYMMDD = useCallback((dateString?: string | Date | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        // toISOString uses UTC which might shift the date by timezone. Better to extract local date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    return { formatToShortMonth, formatToGB, formatToYYYYMMDD };
};
