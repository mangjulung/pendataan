import { Citizen } from '../types';

const API_BASE_URL = '/api/citizens';

export const getCitizens = async (): Promise<Citizen[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch citizens');
    }
    return response.json();
};

export const createCitizen = async (citizenData: Omit<Citizen, 'id'>): Promise<Citizen> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citizenData),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create citizen');
    }
    return response.json();
};

export const updateCitizenApi = async (citizenData: Citizen): Promise<Citizen> => {
    const response = await fetch(`${API_BASE_URL}/${citizenData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citizenData),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update citizen');
    }
    return response.json();
};

export const deleteCitizenApi = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete citizen');
    }
};
