import AddBankAccountModal from '@/components/addBankAccountModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

// Define TypeScript interfaces for type safety
interface WalletAccount {
    id: number;
    user_id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    swift_code: string;
    iban: string;
    bank_address: string;
    home_address: string;
    country: string;
    is_primary: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Wallet',
        href: '/wallet',
    },
];

export default function Index() {
    const { walletAccounts } = usePage().props as { walletAccounts: WalletAccount[] };

    console.log('wallet info:', walletAccounts);

    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);

    const handleAccountClick = (accountId: number) => {
        setSelectedAccountId(accountId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet" />
            <Card className="w-full">
                <div className="flex flex-col gap-4 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Wallet</h1>
                        {/* <Button variant="primary" className="flex items-center rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            <Plus size={18} className="mr-2" /> Add Account
                        </Button> */}
                        <AddBankAccountModal/>
                    </div>

                    {walletAccounts.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No wallet accounts found.</p>
                    ) : (
                        <div className="grid gap-4">
                            {walletAccounts.map((account) => {
                                const isSelected = selectedAccountId === account.id;

                                return (
                                    <div
                                        key={account.id}
                                        className={`flex cursor-pointer flex-col rounded-lg border p-4 transition-all ${
                                            account.is_primary
                                                ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-gray-800'
                                                : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                                        } ${!account.is_primary ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''} ${
                                            isSelected ? 'ring-2 ring-blue-500' : ''
                                        } dark:text-white`}
                                        onClick={() => handleAccountClick(account.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-lg font-semibold">{account.bank_name}</div>
                                                <div className="text-gray-500 dark:text-gray-400">{account.account_name}</div>
                                                <div className="text-gray-500 dark:text-gray-400"> ****{account.account_number.slice(-4)}</div>
                                            </div>
                                            <div>
                                                {account.is_primary ? (
                                                    <span className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white">Primary</span>
                                                ) : (
                                                    <span className="rounded-md bg-gray-400 px-3 py-1 text-xs text-white">Not Primary</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                            {/* <p><strong>Currency:</strong> {account.currency}</p> */}
                                            {/* <p><strong>SWIFT:</strong> {account.swift_code || 'N/A'}</p> */}
                                            {/* <p><strong>IBAN:</strong> {account.iban || 'N/A'}</p> */}
                                            <p>
                                                <strong>Bank Address:</strong> {account.bank_address || 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Home Address:</strong> {account.home_address || 'N/A'}
                                            </p>
                                            <p>
                                                <strong>Country:</strong> {account.country}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Check size={16} className="text-green-500" /> Linked to your wallet
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>
        </AppLayout>
    );
}
