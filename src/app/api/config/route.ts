import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function ensureTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS site_config (
            key VARCHAR UNIQUE,
            value JSONB,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
}

export async function GET(req: Request) {
    try {
        await ensureTable();
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");
        if (key) {
            const rows = await sql`SELECT value FROM site_config WHERE key=${key}`;
            return NextResponse.json(rows[0]?.value ?? null);
        }
        const rows = await sql`SELECT key, value FROM site_config`;
        const config: Record<string, unknown> = {};
        for (const r of rows) config[r.key] = r.value;
        return NextResponse.json(config);
    } catch (e: unknown) {
        console.error("GET /api/config Error:", e);
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json(
            { error: `No se pudo cargar la configuración: ${message}` },
            { status: 500 },
        );
    }
}

export async function PUT(req: Request) {
    try {
        await ensureTable();
        const body = await req.json();
        const { key, value } = body || {};

        if (!key) {
            return NextResponse.json({ error: "El campo 'key' es obligatorio" }, { status: 400 });
        }

        // Ensure value is handled properly for jsonb
        const jsonValue = value !== undefined ? JSON.stringify(value) : null;

        await sql`
            INSERT INTO site_config (key, value) 
            VALUES (${key}, ${jsonValue}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value=${jsonValue}::jsonb, updated_at=now()
        `;
        return NextResponse.json({ ok: true });
    } catch (e: unknown) {
        console.error("PUT /api/config Error:", e);
        const message = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
