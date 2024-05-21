export interface Nft {
    interface: string;
    id: string;
    authorities: Array<{ address: string, scopes: string[] }>;
    burnt: boolean;
    compression: {
        eligible: boolean;
        compressed: boolean;
        data_hash: string;
        creator_hash: string;
        asset_hash: string;
        leaf_id: number;
        seq: number;
        tree: string;
    };
    content: {
        $schema: string;
        files: any[];
        json_uri: string;
        links: Record<string, any>;
        metadata: {
            name: string;
            symbol: string;
            token_standard: string;
        };
    };
    creators: any[];
    grouping: any[];
    mutable: boolean;
    ownership: {
        frozen: boolean;
        delegated: boolean;
        delegate: string | null;
        ownership_model: string;
        owner: string;
    };
    royalty: {
        royalty_model: string;
        target: string | null;
        percent: number;
        basis_points: number;
        primary_sale_happened: boolean;
        locked: boolean;
    };
    supply: {
        print_max_supply: number;
        print_current_supply: number;
        edition_nonce: number;
    };
}
