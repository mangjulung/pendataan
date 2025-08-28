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


import type { Citizen } from '../../types';

// Define the context for Cloudflare Pages Functions
interface Env {
  DB: D1Database;
}

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
