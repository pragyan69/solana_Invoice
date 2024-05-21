'use client'

import dynamic from 'next/dynamic';
import { FC } from "react";
import styles from "../Styles/Home.module.css";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";



const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export const AppBar: FC = () => {
    return (
        <div className={styles.AppHeader}>
            <span>SuperInvoice</span>
            <WalletMultiButtonDynamic />
        </div>
    );
};