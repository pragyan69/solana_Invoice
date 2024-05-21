import { NextResponse } from "next/server";
import { uploadToWeb3Storage } from '../../utils/web3Storage';

const url = `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_KEY}`;

interface MintData {
    name: string;
    symbol: string;
    owner: string;
    [key: string]: any;  // Allow additional fields
}

const createMintPayload = (data: MintData, uri: string) => ({
    jsonrpc: "2.0",
    method: "mintCompressedNft",
    params: {
        name: data.name,
        symbol: data.symbol,
        owner: data.owner,
        uri: uri
    }
});

const mintCompressedNft = async (data: MintData, uri: string): Promise<any> => {
    try {
        const payload = createMintPayload(data, uri);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Minted asset: ', result.assetId);
        return result;
    } catch (error) {
        console.error("Error minting NFT:", error);
        throw error;  // Re-throw to handle it in the calling function
    }
};

export async function POST(request: Request) {
    try {
        const URI_data: MintData = await request.json();
        console.log("Received data:", URI_data);

        const uri = await uploadToWeb3Storage(URI_data); // Upload to Web3.Storage and get the URI
        const result = await mintCompressedNft(URI_data, uri); // Pass the URI to the mint function

        return NextResponse.json({ message: result });
    } catch (error) {
        console.error("Error in POST function:", error);
        // Again check if error is an instance of Error
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
        }
    }
}


