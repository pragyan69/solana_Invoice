import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    const { publicKey } = await request.json();
    const url = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_KEY}`; // Use your environment variable for the API key

    try {
        const response = await axios.post(url, {
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAssetsByOwner',
            params: {
                ownerAddress: publicKey,
                page: 1, // Starts at 1
                limit: 1000,
            },
        });

        const { result } = response.data;
        return NextResponse.json({ items: result.items });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}
