import { useState, useCallback, useEffect } from 'react';
import { Citizen } from '../types';
import { getCitizens, createCitizen, updateCitizenApi, deleteCitizenApi } from '../services/geminiService';

export const useCitizens = () => {
    const [citizens, setCitizens] = useState<Citizen[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCitizens = useCallback(async () => {
        // Don't set loading to true on refetches if data already exists
        if (citizens.length === 0) {
            setIsLoading(true);
        }
        setError(null);
        try {
            const data = await getCitizens();
            setCitizens(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
        } finally {
            setIsLoading(false);
        }
    }, [citizens.length]);

    useEffect(() => {
        fetchCitizens();
    }, [fetchCitizens]);

    const addCitizen = useCallback(async (citizenData: Omit<Citizen, 'id'>) => {
        setIsLoading(true);
        setError(null);
        try {
            await createCitizen(citizenData);
            await fetchCitizens(); // Refetch to get the latest list
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add citizen.");
            setIsLoading(false); // Ensure loading is turned off on error
        }
    }, [fetchCitizens]);

    const updateCitizen = useCallback(async (updatedCitizen: Citizen) => {
        setIsLoading(true);
        setError(null);
        try {
            await updateCitizenApi(updatedCitizen);
            await fetchCitizens(); // Refetch
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update citizen.");
            setIsLoading(false);
        }
    }, [fetchCitizens]);

    const deleteCitizen = useCallback(async (id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data warga ini?")) {
            setIsLoading(true);
            setError(null);
            try {
                await deleteCitizenApi(id);
                await fetchCitizens(); // Refetch
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to delete citizen.");
                setIsLoading(false);
            }
        }
    }, [fetchCitizens]);
    
    return {
        citizens,
        addCitizen,
        updateCitizen,
        deleteCitizen,
        isLoading,
        error
    };
};
