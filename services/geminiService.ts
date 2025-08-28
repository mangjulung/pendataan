
import { GoogleGenAI, Type } from "@google/genai";
import { Citizen } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not be available.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const citizenSchema = {
    type: Type.OBJECT,
    properties: {
        nik: { type: Type.STRING, description: "Nomor Induk Kependudukan (16 digit acak)" },
        kkNumber: { type: Type.STRING, description: "Nomor Kartu Keluarga (16 digit acak)" },
        fullName: { type: Type.STRING, description: "Nama lengkap Indonesia yang umum" },
        placeOfBirth: { type: Type.STRING, description: "Nama kota di Indonesia" },
        dateOfBirth: { type: Type.STRING, description: "Tanggal lahir format YYYY-MM-DD, usia antara 20-60 tahun" },
        gender: { type: Type.STRING, enum: ['Laki-laki', 'Perempuan'] },
        kampung: { type: Type.STRING, description: "Nama kampung atau blok di pedesaan" },
        rt: { type: Type.STRING, description: "Nomor Rukun Tetangga (RT), format '001'" },
        rw: { type: Type.STRING, description: "Nomor Rukun Warga (RW), format '001'" },
        dusun: { type: Type.STRING, description: "Nama Dusun" },
        desa: { type: Type.STRING, description: "Nama Desa" },
        religion: { type: Type.STRING, enum: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Khonghucu'] },
        maritalStatus: { type: Type.STRING, enum: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'] },
        occupation: { type: Type.STRING, description: "Pekerjaan umum di Indonesia" },
        citizenship: { type: Type.STRING, enum: ['WNI', 'WNA'] },
    },
    required: [
        "nik", "kkNumber", "fullName", "placeOfBirth", "dateOfBirth", "gender",
        "kampung", "rt", "rw", "dusun", "desa", "religion", "maritalStatus", "occupation", "citizenship"
    ]
};

export const generateDummyCitizens = async (count: number): Promise<Omit<Citizen, 'id'>[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key for Gemini not configured.");
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate ${count} random Indonesian citizen data objects based on rural/village administrative structure.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: citizenSchema
                }
            }
        });

        let jsonText = response.text.trim();
        
        // Handle potential markdown code block wrapping
        const markdownMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            jsonText = markdownMatch[1];
        }

        // As a fallback, find the first '[' and last ']'
        const startIndex = jsonText.indexOf('[');
        const endIndex = jsonText.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }

        const generatedData = JSON.parse(jsonText);

        if (!Array.isArray(generatedData)) {
            throw new Error("AI did not return a valid array.");
        }
        
        // Basic validation
        return generatedData.filter(item => item.nik && item.fullName);

    } catch (error) {
        console.error("Error generating dummy data with Gemini:", error);
        throw new Error("Failed to generate data from AI. Please check the console for details.");
    }
};
