import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, FileText, Plus, X } from 'lucide-react';
import { useState } from 'react';
import DepositPage from './deposit';
import WithdrawalPage from './withdraw';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

// Updated actions array
const actions = [
    { icon: <ArrowUpRight size={20} />, label: 'Send', id: 'send' },
    { icon: <ArrowDown size={20} />, label: 'Request', id: 'request' },
    { icon: <FileText size={20} />, label: 'Split bill', id: 'split' },
    { icon: <Plus size={20} />, label: 'Top up', id: 'topup' },
];

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

interface TransactionsProps {
  portfolioBalance: number;
  bankAccounts: BankAccount[];
}

interface FormProps {
    portfolioBalance?: number;
    bankAccounts: BankAccount[];
    onClose: () => void;
}

// Form components for each action with explicit typing
const SendForm = ({ onClose, portfolioBalance, bankAccounts }: FormProps) => {
    // console.log('🏦 SendForm got balance:', portfolioBalance)
    //  console.log('SendForm got balance', portfolioBalance, 'and accounts', bankAccounts);

    return (
        <div className="space-y-4 p-2 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-medium text-white dark:text-white">Send Money</h3> {/* Use text-foreground */}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground sm:hidden">
                    {' '}
                    {/* Use text-muted-foreground */}
                    <X size={18} />
                </button>
            </div>
            <WithdrawalPage 
            balance={portfolioBalance}
            bankAccounts={bankAccounts} 
            />
        </div>
    );
};

const RequestForm = ({ onClose }: FormProps) => (
    <div className="space-y-4 p-2 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium text-white dark:text-white">Deposit Cryptocurrency</h3> {/* Use text-foreground */}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground sm:hidden">
                {' '}
                {/* Use text-muted-foreground */}
                <X size={18} />
            </button>
        </div>
        <DepositPage />
    </div>
);

const SplitBillForm = ({ onClose }: FormProps) => (
    <div className="space-y-4 p-2 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium text-white dark:text-white">Split Bill</h3> {/* Use text-foreground */}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground sm:hidden">
                {' '}
                {/* Use text-muted-foreground */}
                <X size={18} />
            </button>
        </div>
        <div className="space-y-3">
            <div>
                <Label htmlFor="description" className="text-foreground text-white dark:text-white">
                    Bill Description
                </Label>{' '}
                {/* Use text-foreground */}
                <Input id="description" placeholder="Dinner, Rent, etc." className="text-foreground border-zinc-700 bg-zinc-800" />{' '}
                {/* Use text-foreground */}
            </div>
            <div>
                <Label htmlFor="totalAmount" className="text-foreground text-white dark:text-white">
                    Total Amount
                </Label>{' '}
                {/* Use text-foreground */}
                <Input id="totalAmount" type="number" placeholder="0.00" className="text-foreground border-zinc-700 bg-zinc-800" />{' '}
                {/* Use text-foreground */}
            </div>
            <div>
                <Label htmlFor="people" className="text-foreground text-white dark:text-white">
                    People to Split With
                </Label>{' '}
                {/* Use text-foreground */}
                <Input id="people" placeholder="Add emails or usernames" className="text-foreground border-zinc-700 bg-zinc-800" />{' '}
                {/* Use text-foreground */}
            </div>
            <div>
                <Label htmlFor="splitType" className="text-foreground text-white dark:text-white">
                    Split Type
                </Label>{' '}
                {/* Use text-foreground */}
                <Select defaultValue="equal">
                    <SelectTrigger className="text-foreground border-zinc-700 bg-zinc-800 text-white">
                        <SelectValue placeholder="How to split" className="text-foreground" /> {/* Use text-foreground */}
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-zinc-800">
                        <SelectItem value="equal" className="text-foreground text-white">
                            Equal
                        </SelectItem>{' '}
                        {/* Use text-foreground */}
                        <SelectItem value="percentage" className="text-foreground text-white">
                            Percentage
                        </SelectItem>{' '}
                        {/* Use text-foreground */}
                        <SelectItem value="custom" className="text-foreground text-white">
                            Custom Amounts
                        </SelectItem>{' '}
                        {/* Use text-foreground */}
                    </SelectContent>
                </Select>
            </div>
            <Button className="mt-5 w-full bg-blue-800 hover:bg-zinc-700 dark:text-white">Split Bill</Button>
        </div>
    </div>
);

const TopUpForm = ({ onClose }: FormProps) => (
    <div className="space-y-4 p-2 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium text-white">Top Up Account</h3> {/* Use text-foreground */}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground sm:hidden">
                {' '}
                {/* Use text-muted-foreground */}
                <X size={18} />
            </button>
        </div>
        <div className="space-y-3">
            <div>
                <Label htmlFor="amount" className="text-foreground text-white">
                    Amount
                </Label>{' '}
                {/* Use text-foreground */}
                <Input id="amount" type="number" placeholder="0.00" className="text-foreground border-zinc-700 bg-zinc-800" />{' '}
                {/* Use text-foreground */}
            </div>
            <div>
                <Label htmlFor="paymentMethod" className="text-foreground text-white">
                    Payment Method
                </Label>{' '}
                {/* Use text-foreground */}
                <Select defaultValue="card">
                    <SelectTrigger className="text-foreground border-zinc-700 bg-zinc-800 text-white">
                        <SelectValue placeholder="Select payment method" className="text-foreground text-white" /> {/* Use text-foreground */}
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-zinc-800">
                        <SelectItem value="card" className="text-foreground text-white">
                            Credit/Debit Card
                        </SelectItem>{' '}
                        {/* Use text-foreground */}
                        <SelectItem value="bank" className="text-foreground text-white">
                            Bank Transfer
                        </SelectItem>{' '}
                        {/* Use text-foreground */}
                        <SelectItem value="paypal" className="text-foreground text-white">
                            PayPal
                        </SelectItem>{' '}
                        {/* Use text-foreground */}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="card" className="text-foreground text-white">
                    Card Details
                </Label>{' '}
                {/* Use text-foreground */}
                <Input id="card" placeholder="XXXX XXXX XXXX XXXX" className="text-foreground border-zinc-700 bg-zinc-800 text-white" />{' '}
                {/* Use text-foreground */}
            </div>
            <Button className="mt-5 w-full bg-blue-800 hover:bg-zinc-700 dark:text-white">Add Funds</Button>
        </div>
    </div>
);

export default function Transactions({ portfolioBalance, bankAccounts }: FormProps) {
    console.log('🧐 WithdrawalPage received balance:', bankAccounts);

    const [activeForm, setActiveForm] = useState<string | null>(null);

    const handleActionClick = (actionId: string, e: React.MouseEvent) => {
        e.preventDefault();
        setActiveForm(actionId === activeForm ? null : actionId);
    };

    const renderForm = () => {
        switch (activeForm) {
            case 'send':
                return <SendForm 
                onClose={() => setActiveForm(null)} 
                portfolioBalance={portfolioBalance} 
                bankAccounts={bankAccounts}
                />;
            case 'request':
                return <RequestForm onClose={() => setActiveForm(null)} />;
            case 'split':
                return <SplitBillForm onClose={() => setActiveForm(null)} />;
            case 'topup':
                return <TopUpForm onClose={() => setActiveForm(null)} />;
            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Send & Request" />
            <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[70vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                    <div className="grid auto-rows-min gap-4">
                        {/* Main Card Container */}
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-zinc-900 dark:bg-zinc-800">
                            <div className="flex h-full flex-col sm:flex-row">
                                {/* Action Buttons Column - Takes full width on mobile, 1/3 on larger screens */}
                                <div className="flex w-full flex-row border-b border-zinc-800 sm:w-1/3 sm:flex-col sm:border-r sm:border-b-0 dark:border-zinc-700">
                                    <div className="flex w-full flex-row sm:h-full sm:flex-col">
                                        {actions.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => handleActionClick(action.id, e)}
                                                className={`flex flex-1 flex-col items-center justify-center py-4 transition-all duration-200 hover:bg-zinc-800 sm:flex-auto sm:py-8 dark:hover:bg-zinc-700 ${
                                                    activeForm === action.id ? 'bg-zinc-800 dark:bg-zinc-700' : ''
                                                }`}
                                            >
                                                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-black p-2 text-white sm:mb-2 sm:h-12 sm:w-12 dark:bg-white dark:text-black">
                                                    {action.icon}
                                                </div>
                                                <span className="text-muted-foreground hover:text-foreground text-center text-xs font-medium sm:text-sm">
                                                    {action.label}
                                                </span>{' '}
                                                {/* Use text-muted-foreground and text-foreground */}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Area - Takes remaining width */}
                                <div className="flex-1 p-2 sm:p-4">
                                    {activeForm ? (
                                        renderForm()
                                    ) : (
                                        <div className="text-muted-foreground flex h-full items-center justify-center">
                                            {' '}
                                            {/* Use text-muted-foreground */}
                                            <p>Select an action to continue</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
