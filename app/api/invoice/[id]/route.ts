import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const baseUrl = `https://devnet.helius-rpc.com?api-key=${process.env.HELIUS_KEY}`;

const getAsset = async (id: string) => {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAsset',
            params: { id },
        }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const { result } = await response.json();
    return result;
};

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: 'ID parameter is missing' }, { status: 400 });
        }

        const result = await getAsset(id);
        return NextResponse.json({ result });
    } catch (error) {
        console.error('Error getting asset:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
        }
    }
}
