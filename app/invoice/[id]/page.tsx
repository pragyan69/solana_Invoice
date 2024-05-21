
'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Attribute {
    trait_type: string;
    value: string;
}

interface Metadata {
    attributes: Attribute[];
    name: string;
    description: string;
    symbol: string;
    token_standard: string;
}

interface Content {
    metadata: Metadata;
    links: {
        external_url: string;
        image: string;
    };
    files: { uri: string }[];
}

interface Asset {
    content: Content;
    ownership: {
        owner: string;
    };
    authorities: {
        address: string;
        scopes: string[];
    }[];
}

interface InvoicePageProps {
    params: {
        id: string;
    };
}

const InvoicePage: React.FC<InvoicePageProps> = ({ params }) => {
    const { id } = params;
    const [asset, setAsset] = useState<Asset | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetch(`/api/invoice/${id}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => setAsset(data.result))
                .catch((err) => setError(err.message));
        }
    }, [id]);

    if (!id) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!asset) {
        return <div>Loading asset data...</div>;
    }

    const {
        content: {
            metadata: { attributes, name, description, symbol, token_standard },
            links: { external_url, image },
            files,
        },
        ownership: { owner },
        authorities,
    } = asset;

    const getAttributeValue = (trait_type: string): string => {
        const attribute = attributes.find((attr) => attr.trait_type === trait_type);
        return attribute ? attribute.value : 'N/A';
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <Card>
                <CardHeader>
                    <CardTitle>{name}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <img src={image} alt="Invoice" style={{ maxWidth: '100%', marginBottom: '20px' }} />
                    <div>
                        <Label>Owner Address</Label>
                        <Input value={owner} readOnly />
                    </div>
                    <div>
                        <Label>Invoice Number</Label>
                        <Input value={getAttributeValue('Invoice Number')} readOnly />
                    </div>
                    <div>
                        <Label>Issued Date</Label>
                        <Input value={getAttributeValue('Issued Date')} readOnly />
                    </div>
                    <div>
                        <Label>Due Date</Label>
                        <Input value={getAttributeValue('Due Date')} readOnly />
                    </div>
                    <div>
                        <Label>From Name</Label>
                        <Input value={getAttributeValue('From Name')} readOnly />
                    </div>
                    <div>
                        <Label>From Email</Label>
                        <Input value={getAttributeValue('From Email')} readOnly />
                    </div>
                    <div>
                        <Label>From Address</Label>
                        <Input value={getAttributeValue('From Address')} readOnly />
                    </div>
                    <div>
                        <Label>To Name</Label>
                        <Input value={getAttributeValue('To Name')} readOnly />
                    </div>
                    <div>
                        <Label>To Email</Label>
                        <Input value={getAttributeValue('To Email')} readOnly />
                    </div>
                    <div>
                        <Label>To Address</Label>
                        <Input value={getAttributeValue('To Address')} readOnly />
                    </div>
                    <div>
                        <Label>Tax ID</Label>
                        <Input value={getAttributeValue('Tax ID')} readOnly />
                    </div>
                    <h2>Items</h2>
                    {attributes.filter((attr) => attr.trait_type.startsWith('Description')).map((item, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                            <div>
                                <Label>Description</Label>
                                <Input value={getAttributeValue(`Description ${index + 1}`)} readOnly />
                            </div>
                            <div>
                                <Label>Quantity</Label>
                                <Input value={getAttributeValue(`Quantity ${index + 1}`)} readOnly />
                            </div>
                            <div>
                                <Label>Unit Price</Label>
                                <Input value={getAttributeValue(`Unit Price ${index + 1}`)} readOnly />
                            </div>
                            <div>
                                <Label>Amount</Label>
                                <Input value={getAttributeValue(`Amount ${index + 1}`)} readOnly />
                            </div>
                        </div>
                    ))}
                    <div>
                        <Label>Subtotal</Label>
                        <Input value={getAttributeValue('Subtotal')} readOnly />
                    </div>
                    <div>
                        <Label>Tax</Label>
                        <Input value={getAttributeValue('Tax')} readOnly />
                    </div>
                    <div>
                        <Label>Total</Label>
                        <Input value={getAttributeValue('Total')} readOnly />
                    </div>
                    <div>
                        <Label>Payable In</Label>
                        <Input value={getAttributeValue('Payable In')} readOnly />
                    </div>
                    <div>
                        <Label>Payment Method</Label>
                        <Input value={getAttributeValue('Payment Method')} readOnly />
                    </div>
                    <div>
                        <Label>Note</Label>
                        <Input value={getAttributeValue('Note')} readOnly />
                    </div>
                    <h2>Files</h2>
                    {files.map((file, index) => (
                        <div key={index}>
                            <a href={file.uri} target="_blank" rel="noopener noreferrer">{file.uri}</a>
                        </div>
                    ))}
                    <h2>Authorities</h2>
                    {authorities.map((authority, index) => (
                        <div key={index}>
                            <div>
                                <Label>Authority Address</Label>
                                <Input value={authority.address} readOnly />
                            </div>
                            <div>
                                <Label>Scopes</Label>
                                <Input value={authority.scopes.join(', ')} readOnly />
                            </div>
                        </div>
                    ))}
                    <div>
                        <Label>External URL</Label>
                        <a href={external_url} target="_blank" rel="noopener noreferrer">{external_url}</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InvoicePage;
