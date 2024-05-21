'use client';
import { useState, useCallback } from 'react';
import { createQR, encodeURL } from '@solana/pay';
import { Keypair, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletModalButton } from '@solana/wallet-adapter-react-ui';

export default function Home() {
    const [qrCode, setQrCode] = useState<string>();
    const [reference, setReference] = useState<string>();
    const wallet = useWallet();

    const handleGenerateClick = useCallback(async () => {
        if (!wallet.connected || !wallet.publicKey) {
            throw new WalletNotConnectedError();
        }

        const res = await fetch('/api/pay', { method: 'POST' });
        const { url, ref } = await res.json();

        const qr = createQR(url);
        const qrBlob = await qr.getRawData('png');
        if (!qrBlob) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                setQrCode(event.target.result);
            }
        };
        reader.readAsDataURL(qrBlob);
        setReference(ref);
    }, [wallet]);

    const handleVerifyClick = async () => {
        if (!reference) {
            alert('Please generate a payment order first');
            return;
        }

        const res = await fetch(`/api/pay?reference=${reference}`);
        const { status } = await res.json();

        if (status === 'verified') {
            alert('Transaction verified');
            setQrCode(undefined);
            setReference(undefined);
        } else {
            alert('Transaction not found');
        }
    };

    return (
        <div className="container">
            <h1>Solana Pay Demo</h1>
            {!wallet.connected && <WalletModalButton />}
            {wallet.connected && (
                <>
                    {qrCode && (
                        <img
                            src={qrCode}
                            alt="QR Code"
                            width={200}
                            height={200}
                        />
                    )}
                    <div>
                        <button onClick={handleGenerateClick}>
                            Generate Solana Pay Order
                        </button>
                        {reference && (
                            <button onClick={handleVerifyClick}>
                                Verify Transaction
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
