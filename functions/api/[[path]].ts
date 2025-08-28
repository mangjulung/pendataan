// Fix: Cloudflare worker types were not found, causing compilation errors.
// As a workaround, minimal type definitions for the Cloudflare Pages environment are provided below
// to resolve D1Database, PagesFunction, and other environment-specific types.

interface D1PreparedStatement {
    bind(...values: any[]): this;
    run(): Promise<any>;
    all<T = unknown>(): Promise<{ results?: T[] }>;
}

interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<any>;
}

// A custom Request type that includes the generic .json() method from Cloudflare workers
interface CloudflareRequest extends Request {
    json<T = any>(): Promise<T>;
}

interface EventContext<Env = any, Params = any, Data extends Record<string, unknown> = Record<string, unknown>> {
    request: CloudflareRequest;
    env: Env;
    params: Params;
}

type PagesFunction<
    Env = any,
    Params = any,
    Data extends Record<string, unknown> = Record<string, unknown>
> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;


import { GoogleGenAI, Type } from "@google/genai";
import type { Citizen } from '../../types';

// Define the context for Cloudflare Pages Functions
interface Env {
  DB: D1Database;
}

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


// Fix: Refactor to align with Gemini API guidelines. The API key must be sourced from process.env.API_KEY.
const generateDummyCitizensFromAI = async (count: number): Promise<Omit<Citizen, 'id'>[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key for Gemini not configured on the server.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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
        const startIndex = jsonText.indexOf('[');
        const endIndex = jsonText.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1) {
            jsonText = jsonText.substring(startIndex, endIndex + 1);
        }

        const generatedData = JSON.parse(jsonText);

        if (!Array.isArray(generatedData)) {
            throw new Error("AI did not return a valid array.");
        }
        
        return generatedData.filter(item => item.nik && item.fullName);

    } catch (error) {
        console.error("Error generating dummy data with Gemini:", error);
        throw new Error("Failed to generate data from AI. Please check the server logs for details.");
    }
};


export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const path = (params as any).path as string[];
    const resource = path[0];
    const idOrAction = path[1];

    if (resource !== 'citizens') {
        return new Response('Not Found', { status: 404 });
    }

    try {
        switch (request.method) {
            case 'GET': {
                const { results } = await env.DB.prepare("SELECT * FROM citizens ORDER BY createdAt DESC").all<Citizen>();
                return Response.json(results);
            }
            case 'POST': {
                if (idOrAction === 'generate') {
                    const { count } = await request.json<{ count: number }>();
                    if (!count || count <= 0 || count > 10) {
                        return new Response('Invalid count. Must be between 1 and 10.', { status: 400 });
                    }
                    // Fix: Call updated function without passing API key.
                    const newCitizenData = await generateDummyCitizensFromAI(count);
                    
                    const stmt = env.DB.prepare(
                        "INSERT INTO citizens (id, nik, kkNumber, fullName, placeOfBirth, dateOfBirth, gender, kampung, rt, rw, dusun, desa, religion, maritalStatus, occupation, citizenship) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    );
                    const batch = newCitizenData.map(c => {
                        return stmt.bind(crypto.randomUUID(), c.nik, c.kkNumber, c.fullName, c.placeOfBirth, c.dateOfBirth, c.gender, c.kampung, c.rt, c.rw, c.dusun, c.desa, c.religion, c.maritalStatus, c.occupation, c.citizenship);
                    });
                    await env.DB.batch(batch);

                    return new Response('Citizens generated successfully', { status: 201 });
                } else {
                    const citizen = await request.json<Omit<Citizen, 'id'>>();
                    const citizenId = crypto.randomUUID();
                    await env.DB.prepare(
                         "INSERT INTO citizens (id, nik, kkNumber, fullName, placeOfBirth, dateOfBirth, gender, kampung, rt, rw, dusun, desa, religion, maritalStatus, occupation, citizenship) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                    ).bind(
                        citizenId, citizen.nik, citizen.kkNumber, citizen.fullName, citizen.placeOfBirth, citizen.dateOfBirth, citizen.gender, citizen.kampung,
                        citizen.rt, citizen.rw, citizen.dusun, citizen.desa, citizen.religion, citizen.maritalStatus, citizen.occupation, citizen.citizenship
                    ).run();
                    
                    const newCitizen = { ...citizen, id: citizenId };
                    return Response.json(newCitizen, { status: 201 });
                }
            }
            case 'PUT': {
                const citizen = await request.json<Citizen>();
                await env.DB.prepare(
                    "UPDATE citizens SET nik = ?, kkNumber = ?, fullName = ?, placeOfBirth = ?, dateOfBirth = ?, gender = ?, kampung = ?, rt = ?, rw = ?, dusun = ?, desa = ?, religion = ?, maritalStatus = ?, occupation = ?, citizenship = ? WHERE id = ?"
                ).bind(
                    citizen.nik, citizen.kkNumber, citizen.fullName, citizen.placeOfBirth, citizen.dateOfBirth, citizen.gender, citizen.kampung, citizen.rt,
                    citizen.rw, citizen.dusun, citizen.desa, citizen.religion, citizen.maritalStatus, citizen.occupation, citizen.citizenship, idOrAction
                ).run();
                return Response.json(citizen);
            }
            case 'DELETE': {
                await env.DB.prepare("DELETE FROM citizens WHERE id = ?").bind(idOrAction).run();
                return new Response(null, { status: 204 });
            }
            default:
                return new Response('Method Not Allowed', { status: 405 });
        }
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An internal server error occurred.';
        return new Response(errorMessage, { status: 500 });
    }
};