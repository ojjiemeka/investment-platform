import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';

interface BankAccount {
    id: number;
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
    balance: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Withdrawal',
        href: '/withdrawal',
    },
];

// Format currency function
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
    }).format(value);
};

interface WithdrawalPageProps {
    balance: number;
    bankAccounts: BankAccount[];
}

export default function WithdrawalPage({ balance, bankAccounts }: WithdrawalPageProps) {
    // console.log('🧐 WithdrawalPage received balance:', balance);
    return (
        <>
            <div className="space-y-3 text-white dark:text-white">
                <div>
                    <div className="mt-8 mb-8 flex justify-between">
                        <h1 className="text-2xl font-bold">Balance:</h1>
                        <h1 className="text-2xl font-bold">{formatCurrency(balance)}</h1>
                    </div>

                    <Label htmlFor="bank-account">Select an account</Label>
                    <div className="mt-2">
                        <Select>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a bank account" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Bank Accounts</SelectLabel>
                                    {bankAccounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            <div className="flex w-full items-center justify-between">
                                                <span>
                                                    {acc.bank_name} • …{acc.account_number.slice(-4)}
                                                </span>
                                                <span className="flex items-center space-x-1 mx-2">
                                                    {acc.is_primary && (
                                                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">Primary</span>
                                                    )}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" placeholder="0.00" className="border-zinc-700 bg-zinc-800" />
                </div>
                <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="usd">
                        <SelectTrigger className="border-zinc-700 bg-zinc-800">
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-700 bg-zinc-800">
                            <SelectItem value="usd">USD</SelectItem>
                            <SelectItem value="eur">EUR</SelectItem>
                            <SelectItem value="gbp">GBP</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="note">Note (optional)</Label>
                    <Input id="note" placeholder="Add a note" className="border-zinc-700 bg-zinc-800" />
                </div>

                <div>
                    <Link className="text-[13px] text-red-700 hover:text-red-800 hover:underline" href="/wallet/external">
                        add external account{' '}
                    </Link>
                </div>

                <Button variant="default" className="w-full bg-blue-800 hover:bg-zinc-700 dark:text-white">
                    Send Payment
                </Button>
            </div>
        </>
    );
}
