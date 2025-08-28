
import { useState, useCallback } from 'react';
import { Citizen } from '../types';
import { generateDummyCitizens } from '../services/geminiService';

const initialCitizens: Citizen[] = [
    {
        id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
        nik: "3201010101800001",
        kkNumber: "3201010101800001",
        fullName: "Budi Santoso",
        placeOfBirth: "Bogor",
        dateOfBirth: "1980-01-01",
        gender: "Laki-laki",
        kampung: "Cibedug",
        rt: "001",
        rw: "003",
        dusun: "Dusun 2",
        desa: "Cijayanti",
        religion: "Islam",
        maritalStatus: "Kawin",
        occupation: "Petani",
        citizenship: "WNI"
    },
    {
        id: "b2c3d4e5-f6a1-2345-6789-0abcdef12345",
        nik: "3201020202900002",
        kkNumber: "3201020202900002",
        fullName: "Siti Aminah",
        placeOfBirth: "Bogor",
        dateOfBirth: "1990-02-02",
        gender: "Perempuan",
        kampung: "Bojong Koneng",
        rt: "002",
        rw: "005",
        dusun: "Dusun 1",
        desa: "Bojong Koneng",
        religion: "Islam",
        maritalStatus: "Belum Kawin",
        occupation: "Ibu Rumah Tangga",
        citizenship: "WNI"
    }
];


export const useCitizens = () => {
    const [citizens, setCitizens] = useState<Citizen[]>(initialCitizens);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addCitizen = useCallback((citizenData: Omit<Citizen, 'id'>) => {
        const newCitizen: Citizen = {
            ...citizenData,
            id: crypto.randomUUID(),
        };
        setCitizens(prev => [newCitizen, ...prev]);
    }, []);

    const updateCitizen = useCallback((updatedCitizen: Citizen) => {
        setCitizens(prev => prev.map(c => c.id === updatedCitizen.id ? updatedCitizen : c));
    }, []);

    const deleteCitizen = useCallback((id: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data warga ini?")) {
            setCitizens(prev => prev.filter(c => c.id !== id));
        }
    }, []);

    const generateAndAddCitizens = useCallback(async (count: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const newCitizenData = await generateDummyCitizens(count);
            const newCitizens = newCitizenData.map(c => ({ ...c, id: crypto.randomUUID() }));
            setCitizens(prev => [...newCitizens, ...prev]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    return {
        citizens,
        addCitizen,
        updateCitizen,
        deleteCitizen,
        generateAndAddCitizens,
        isLoading,
        error
    };
};