import { sql } from './src/lib/db';

async function run() {
    const config = {
        access_token: 'APP_USR-843318059666874-051100-b5a263cfaa834e9be2fc4b0d6784b040-2069611075',
        public_key: 'APP_USR-f65ecfa1-e32c-412b-b297-3b21e1bfbb92',
        client_id: '843318059666874',
        client_secret: 'eZZ2LP1Tk2moIDuJphJ7cLLmJGyF6OT6'
    };

    const res = await sql`
        UPDATE payment_gateways 
        SET config = ${JSON.stringify(config)}::jsonb, 
            test_mode = false, 
            active = true 
        WHERE type = 'mercadopago' 
        RETURNING *
    `;
    console.log(res);
    process.exit(0);
}

run();
