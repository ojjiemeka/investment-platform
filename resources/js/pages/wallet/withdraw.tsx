import BackButton from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet" />
            <BackButton/>

            <div className="flex h-full flex-col items-center gap-4 rounded-xl p-4">
                <Card className="w-full space-y-6 p-6">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold">Balance:</h1>
                        <h1 className="text-2xl font-bold"> $2,000,000</h1>
                    </div>

                    <div className="space-y-2">
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

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="withdrawal-amount">Withdrawal Amount</Label>
                        <Input className="mt-2" type="text" id="withdrawal-amount" placeholder="Enter amount" />
                    </div>

                    <Button variant="link">
                        <Link className="text-[13px] text-red-700" href="/wallet/external">
                            add external account{' '}
                        </Link>
                    </Button>

                    <div className="text-center">
                        <Button>Withdraw</Button>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
