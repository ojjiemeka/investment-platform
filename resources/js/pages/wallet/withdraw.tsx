import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';

interface BankAccount {
    name: string;
    amount: number;
    status: string;
    logo?: React.ReactNode;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Withdrawal',
        href: '/withdrawal',
    },
];

const bankAccounts: BankAccount[] = [
    {
        name: 'HSBC Holdings plc',
        amount: 20456.0,
        status: 'Active',
        logo: 'HSBC',
    },
    {
        name: 'Deutsche Bank',
        amount: 20456.0,
        status: 'Active',
        logo: 'DB',
    },
    {
        name: 'UBS Group AG',
        amount: 20456.0,
        status: 'Active',
        logo: 'UBS',
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

export default function WithdrawalPage() {
    return (
        <>
            <div className="space-y-3">
                <div>
                    <div className="mt-8 mb-8 flex justify-between">
                        <h1 className="text-2xl font-bold">Balance:</h1>
                        <h1 className="text-2xl font-bold"> $2,000,000</h1>
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
                                    {bankAccounts.map((account, index) => (
                                        <SelectItem key={index} value={account.name.toLowerCase().replace(/\s+/g, '-')}>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-xs">
                                                    {typeof account.logo === 'string' ? account.logo : 'B'}
                                                </div>
                                                <span>
                                                    {account.name} ({formatCurrency(account.amount)})
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
                    {/* <Button variant="link"> */}
                    <Link className="text-[13px] text-red-700 hover:text-red-800 hover:underline" href="/wallet/external">
                        add external account{' '}
                    </Link>
                    {/* </Button> */}
                </div>

                <Button className="w-full">Send Payment</Button>
            </div>
        </>
    );
}
