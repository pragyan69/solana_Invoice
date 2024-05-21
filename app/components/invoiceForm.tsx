"use client";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useWallet } from "@solana/wallet-adapter-react";

const formSchema = z.object({
    invoiceNumber: z.string().min(1, "Invoice number is required."),
    issuedDate: z.string().min(1, "Issued date is required."),
    dueDate: z.string().min(1, "Due date is required."),
    fromName: z.string().min(1, "From name is required."),
    fromEmail: z.string().email("Invalid email."),
    fromAddress: z.string().min(1, "From address is required."),
    toName: z.string().min(1, "To name is required."),
    toEmail: z.string().email("Invalid email."),
    toAddress: z.string().min(1, "To address is required."),
    taxId: z.string().min(1, "Tax ID is required."),
    currency: z.string().min(1, "Currency is required."),
    items: z.array(
        z.object({
            description: z.string().min(1, "Description is required."),
            quantity: z.number().min(1, "Quantity must be at least 1"),
            unitPrice: z.number().min(0.01, "Unit Price must be at least 0"),
            amount: z.number().min(0.01, "Amount must be at least 0.01"),
        })
    ),
    note: z.string().optional(),
    discount: z
        .number()
        .min(0, "Discount must be at least 0")
        .max(100, "Discount cannot exceed 100"),
    tax: z
        .number()
        .min(0, "Tax must be at least 0")
        .max(100, "Tax cannot exceed 100"),
    subtotal: z.number().min(0.01, "Subtotal must be at least 0.01"),
    total: z.number().min(0.01, "Total must be at least 0.01"),
    payableIn: z.string().min(1, "Payable in is required."),
    paymentMethod: z.string().min(1, "Payment method is required."),
});

export function InvoiceForm() {
    const { publicKey, connected } = useWallet();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceNumber: "",
            issuedDate: "",
            dueDate: "",
            fromName: "",
            fromEmail: "",
            fromAddress: "",
            toName: "",
            toEmail: "",
            toAddress: "",
            taxId: "",
            currency: "USD",
            note: "",
            discount: 0,
            tax: 0,
            items: [{ description: "", quantity: 1, unitPrice: 0.01, amount: 0.01 }],
            subtotal: 0.01,
            total: 0.01,
            payableIn: "Ethereum",
            paymentMethod: "Ethereum",
        },
    });

    const { fields, append } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const watchDiscount = useWatch({ control: form.control, name: "discount" });
    const watchTax = useWatch({ control: form.control, name: "tax" });
    const watchItems = useWatch({ control: form.control, name: "items" });

    const calculateSubtotal = (items: any) => {
        return items.reduce((acc: any, item: any) => {
            const quantity = parseFloat(item.quantity) || 1;
            const unitPrice = parseFloat(item.unitPrice) || 0.01;
            return acc + quantity * unitPrice;
        }, 0);
    };

    const calculateAmt = (index: any) => {
        const items = form.getValues("items");
        const item = items[index];
        if (item.quantity && item.unitPrice) {
            const amount = item.quantity * item.unitPrice;
            form.setValue(`items.${index}.amount`, amount);
            const subtotal = calculateSubtotal(items);
            form.setValue("subtotal", subtotal);
            calculateTotal(subtotal);
        }
    };

    const calculateTotal = (subtotal: any) => {
        const discountAmount = (subtotal * watchDiscount) / 100;
        const taxAmount = (subtotal * watchTax) / 100;
        const total = subtotal - discountAmount + taxAmount;
        form.setValue("total", total);
    };

    const handleAppend = () => {
        append({
            description: "",
            quantity: 1,
            unitPrice: 0.01,
            amount: 0.01,
        });

        const items = form.getValues("items");
        const subtotal = calculateSubtotal(items);
        form.setValue("subtotal", subtotal);
        calculateTotal(subtotal);
    };

    const onSubmit = async (values: any) => {
        if (!publicKey) {
            console.error("Wallet not connected");
            return;
        }

        const mintData = {
            ...values,
            name: `Invoice #${values.invoiceNumber}`,
            symbol: "INV",
            owner: publicKey.toBase58(),
        };

        try {
            const response = await axios.post("/api/createNFT", mintData);
            console.log("Minted NFT:", response.data);
        } catch (error) {
            console.error("Error minting NFT:", error);
        }
    };

    return (
        <div className="flex justify-center">
            <div className="max-w-4xl w-full p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {connected && publicKey && (
                            <p>Wallet Connected: {publicKey.toBase58()}</p>
                        )}
                        <FormField
                            control={form.control}
                            name="invoiceNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Invoice Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter invoice number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="issuedDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Issued Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter issued date"
                                            type="date"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Due Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter due date"
                                            type="date"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fromName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fromEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fromAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>From Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="toName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter recipient's name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="toEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter recipient's email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="toAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter recipient's address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="taxId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tax ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter tax ID" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter currency" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {fields.map((item, index) => (
                            <div key={item.id}>
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.description`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantity</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) => {
                                                        field.onChange(Number(e.target.value));
                                                        calculateAmt(index);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.unitPrice`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit Price</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    onChange={(e) => {
                                                        field.onChange(Number(e.target.value));
                                                        calculateAmt(index);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.amount`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                        <Button type="button" onClick={handleAppend}>
                            Add Item
                        </Button>
                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter any additional notes"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subtotal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtotal</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(Number(e.target.value));
                                                calculateTotal(form.getValues("subtotal"));
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tax"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tax (%)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(Number(e.target.value));
                                                calculateTotal(form.getValues("subtotal"));
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="total"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="payableIn"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payable In</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter payment currency" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter payment method" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit Invoice</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
