'use client'
import { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import * as web3 from '@solana/web3.js'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
require('@solana/wallet-adapter-react-ui/styles.css')
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {

    const network = WalletAdapterNetwork.Devnet;

    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network })
    ], [network]);

    const endpoint = web3.clusterApiUrl('devnet')

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export default WalletContextProvider






