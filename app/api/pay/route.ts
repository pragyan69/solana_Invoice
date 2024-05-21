import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

// CONSTANTS
const myWallet = 'DemoKMZWkk483hX4mUrcJoo3zVvsKhm8XXs28TuwZw9H'; // Replace with your wallet address
const recipient = new PublicKey(myWallet);
const amount = new BigNumber(0.0001); // 0.0001 SOL
const label = 'QuickNode Guide Store';
const memo = 'QN Solana Pay Demo Public Memo';
const quicknodeEndpoint = 'https://example.solana-devnet.quiknode.pro/123456/'; // Replace with your QuickNode endpoint

const paymentRequests = new Map<string, { recipient: PublicKey; amount: BigNumber; memo: string }>();

async function generateUrl(
    recipient: PublicKey,
    amount: BigNumber,
    reference: PublicKey,
    label: string,
    message: string,
    memo: string,
) {
    const url: URL = encodeURL({
        recipient,
        amount,
        reference,
        label,
        message,
        memo,
    });
    return { url };
}

async function verifyTransaction(reference: PublicKey) {
    const paymentData = paymentRequests.get(reference.toBase58());
    if (!paymentData) {
        throw new Error('Payment request not found');
    }
    const { recipient, amount, memo } = paymentData;

    const connection = new Connection(quicknodeEndpoint, 'confirmed');

    const found = await findReference(connection, reference);

    const response = await validateTransfer(
        connection,
        found.signature,
        {
            recipient,
            amount,
            splToken: undefined,
            reference,
        },
        { commitment: 'confirmed' }
    );

    if (response) {
        paymentRequests.delete(reference.toBase58());
    }
    return response;
}

export async function POST(req: NextRequest) {
    try {
        const reference = new Keypair().publicKey;
        const message = `QuickNode Demo - Order ID #0${Math.floor(Math.random() * 999999) + 1}`;
        const urlData = await generateUrl(
            recipient,
            amount,
            reference,
            label,
            message,
            memo
        );
        const ref = reference.toBase58();
        paymentRequests.set(ref, { recipient, amount, memo });
        const { url } = urlData;
        return NextResponse.json({ url: url.toString(), ref });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    if (!reference) {
        return NextResponse.json({ error: 'Missing reference query parameter' }, { status: 400 });
    }
    try {
        const referencePublicKey = new PublicKey(reference);
        const response = await verifyTransaction(referencePublicKey);
        if (response) {
            return NextResponse.json({ status: 'verified' });
        } else {
            return NextResponse.json({ status: 'not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
