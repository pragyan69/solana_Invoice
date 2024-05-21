'use client'
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { Nft } from '../utils/nft'; // Adjust the import path accordingly
import Link from 'next/link';

const fetchNfts = async (publicKey: string): Promise<Nft[]> => {
    const response = await axios.post('/api/invoice', { publicKey });
    if (response.status === 200) {
        console.log(response.data.items);
        return response.data.items;
    } else {
        throw new Error('Failed to fetch NFTs');
    }
};

const Page = () => {
    const { publicKey, connected } = useWallet();
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getNfts = async () => {
            if (publicKey) {
                setLoading(true);
                try {
                    const fetchedNfts = await fetchNfts(publicKey.toString());
                    setNfts(fetchedNfts);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        };

        getNfts();
    }, [publicKey]);
    const isIpfsLink = (url: string) => url.includes('.ipfs.');
    const filteredNfts = nfts.filter(nft => (nft.content.metadata.symbol === 'INV' && isIpfsLink(nft.content.json_uri)));
    const burnedNfts = filteredNfts.filter(nft => nft.burnt);
    const nonBurnedNfts = filteredNfts.filter(nft => !nft.burnt);

    return (
        <div>
            <h1>NFTs</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <h2>Non-Burned NFTs</h2>
                    {nonBurnedNfts.length > 0 ? (
                        <ul>
                            {nonBurnedNfts.map((nft, index) => (
                                <li key={index}>
                                    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
                                        <p><strong>Name:</strong> {nft.content.metadata.name}</p>
                                        <p><strong>Address:</strong> {nft.id}</p>
                                        <p><strong>Metadata URI:</strong> <a href={nft.content.json_uri} target="_blank" rel="noopener noreferrer">{nft.content.json_uri}</a></p>
                                        <Link href={`/invoice/${nft.id}`}>
                                            <button>View Invoice</button>
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No non-burned NFTs found</p>
                    )}

                    <h2>Burned NFTs</h2>
                    {burnedNfts.length > 0 ? (
                        <ul>
                            {burnedNfts.map((nft, index) => (
                                <li key={index}>
                                    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
                                        <p><strong>Name:</strong> {nft.content.metadata.name}</p>
                                        <p><strong>Address:</strong> {nft.id}</p>
                                        <p><strong>Metadata URI:</strong> <a href={nft.content.json_uri} target="_blank" rel="noopener noreferrer">{nft.content.json_uri}</a></p>
                                        <Link href={`/invoice/${nft.id}`}>
                                            <button>View Invoice</button>
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No burned NFTs found</p>
                    )}
                </>
            )}
        </div>
    );
};

export default Page;
