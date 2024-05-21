import { create } from '@web3-storage/w3up-client';
import { StoreMemory } from '@web3-storage/access/stores/store-memory'
import * as Signer from '@ucanto/principal/ed25519';
import { CarReader } from '@ipld/car';
import { importDAG } from '@ucanto/core/delegation';
import { Block } from 'multiformats/block';
import { File, Blob } from 'node-fetch';

const principal = Signer.parse(process.env.WEB3_STORAGE_KEY!);
const proof = process.env.WEB3_STORAGE_PROOF!;

const uploadToWeb3Storage = async (data: any) => {
    try {
        const store = new StoreMemory();
        const client = await create({ principal, store });

        const parsedProof = await parseProof(proof);
        const space = await client.addSpace(parsedProof);
        await client.setCurrentSpace(space.did());

        // Convert data to JSON Blob
        const jsonData = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const file = new File([jsonData], 'metadata.json', { type: 'application/json' });

        const cid = await client.uploadDirectory([file]);
        const uri = `https://${cid}.ipfs.w3s.link/metadata.json`;
        return uri;
    } catch (error) {
        console.error("Error uploading to Web3.Storage:", error);
        throw error;
    }
};

/** @param {string} data Base64 encoded CAR file */
async function parseProof(data: string) {
    const blocks: Block<any, number, number, 1>[] = [];
    const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'));
    for await (const block of reader.blocks()) {
        blocks.push(block as Block<any, number, number, 1>);
    }
    return importDAG(blocks);
}

export { uploadToWeb3Storage };
