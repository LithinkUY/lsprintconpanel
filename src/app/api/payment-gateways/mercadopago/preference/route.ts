import { NextResponse } from "next/server";

// POST /api/payment-gateways/mercadopago/preference
// Crea una preference de MercadoPago y devuelve el init_point (URL de pago)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, payer, external_reference, back_urls, notification_url } = body;

        // Integración nativa forzada a producción a pedido del cliente
        const access_token = "APP_USR-843318059666874-051100-b5a263cfaa834e9be2fc4b0d6784b040-2069611075";
        const is_test = false;

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                        req.headers.get("origin") || 
                        (req.headers.get("referer") ? new URL(req.headers.get("referer")!).origin : "https://lsprint.uy");

        const preference = {
            items: items ?? [],
            payer: payer ?? {},
            external_reference: external_reference ?? "",
            back_urls: back_urls ?? {
                success: `${baseUrl}/checkout/success`,
                failure: `${baseUrl}/checkout/failure`,
                pending: `${baseUrl}/checkout/pending`,
            },
            auto_return: "approved",
            notification_url: notification_url ?? `${baseUrl}/api/webhooks/mercadopago`,
        };

        const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${access_token}`,
            },
            body: JSON.stringify(preference),
        });

        if (!mpRes.ok) {
            const err = await mpRes.text();
            return NextResponse.json({ error: "Error de MercadoPago", detail: err }, { status: 502 });
        }

        const data = await mpRes.json();

        return NextResponse.json({
            preference_id: data.id,
            init_point: data.init_point, // Forzado a producción real
            sandbox_init_point: data.sandbox_init_point,
            is_test,
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error", detail: error.message || String(error) }, { status: 500 });
    }
}
