import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, FileText, MoreHorizontal, Plus } from 'lucide-react';

interface BankAccount {
    name: string;
    amount: number;
    status: string;
    logo?: React.ReactNode;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Wallet',
        href: '/wallet',
    },
];

const invoices = [
    {
        invoice: 'INV001',
        paymentStatus: 'Paid',
        totalAmount: '$250.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoice: 'INV002',
        paymentStatus: 'Pending',
        totalAmount: '$150.00',
        paymentMethod: 'PayPal',
    },
    {
        invoice: 'INV003',
        paymentStatus: 'Unpaid',
        totalAmount: '$350.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        invoice: 'INV004',
        paymentStatus: 'Paid',
        totalAmount: '$450.00',
        paymentMethod: 'Credit Card',
    },
    {
        invoice: 'INV005',
        paymentStatus: 'Paid',
        totalAmount: '$550.00',
        paymentMethod: 'PayPal',
    },
    {
        invoice: 'INV006',
        paymentStatus: 'Pending',
        totalAmount: '$200.00',
        paymentMethod: 'Bank Transfer',
    },
    {
        invoice: 'INV007',
        paymentStatus: 'Unpaid',
        totalAmount: '$300.00',
        paymentMethod: 'Credit Card',
    },
];

// Updated actions array with href properties
const actions = [
    { icon: <ArrowUpRight size={20} />, label: 'Send', href: '/wallet/withdrawal' },
    { icon: <ArrowDown size={20} />, label: 'Request', href: '/wallet/request' },
    { icon: <FileText size={20} />, label: 'Split bill', href: '/wallet/split-bill' },
    { icon: <Plus size={20} />, label: 'Top up', href: '/wallet/top-up' },
];

const totalBal = "$2,000,000";

// Bank accounts data
const bankAccounts: BankAccount[] = [
    {
        name: 'HSBC Holdings plc',
        amount: 20456.0,
        status: 'Active',
        logo: 'HSBC', // We'll render a placeholder for this
    },
    {
        name: 'Deutsche Bank',
        amount: 20456.0,
        status: 'Active',
        logo: 'DB', // We'll render a placeholder for this
    },
    {
        name: 'UBS Group AG',
        amount: 20456.0,
        status: 'Active',
        logo: 'UBS', // We'll render a placeholder for this
    },
];

export default function Index() {
    // Format currency
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Bank account list component
    const BankAccountList = () => {
        return (
            <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border">
                <Card className="h-full w-full py-0">
                    <CardContent className="flex flex-col p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium">Bank Account</h3>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Scrollable container with explicit height and overflow properties */}
                        <div className="custom-scrollbar mb-4 max-h-48 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            <div className="space-y-4">
                                {bankAccounts.map((account, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs">
                                                {/* Placeholder for bank logo */}
                                                {typeof account.logo === 'string' ? account.logo : 'B'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{account.name}</p>
                                                <p className="text-muted-foreground text-sm">{formatCurrency(account.amount)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                            <span className="text-muted-foreground text-xs">{account.status}</span>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs">BofA</div>
                                        <div>
                                            <p className="text-sm font-medium">Bank of America</p>
                                            <p className="text-muted-foreground text-sm">{formatCurrency(12345.67)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                        <span className="text-muted-foreground text-xs">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button className="mt-auto w-full bg-blue-600 text-white hover:bg-blue-700">Connect Bank</Button>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet" />
            
            <div className="flex h-full flex-col gap-4 rounded-xl p-4">
            <div className="flex justify-between">
                <div>
                    <h1 className='font-mono text-2xl'>Total Balance: {totalBal} </h1>
                </div>
                <div>
                    <Button className='bg-blue-500 text-white text-[13px] hover:bg-zinc-800'>    
                        <a href='/wallet/withdrawal'>Withdraw Earnings</a>
                    </Button>
                </div>
            </div>
                {/* First row of cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2">
                    {/* Quick Actions */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-900 p-4">
                            <div className="grid max-w-md grid-cols-4 gap-8">
                            {actions.map((action, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <Link
                                            href={action.href}
                                            className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-black p-2 text-white transition-all duration-200 hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-lg"
                                        >
                                            {action.icon}
                                        </Link>
                                        <Link
                                            href={action.href}
                                            className="text-center text-xs font-medium text-gray-300 hover:text-white"
                                        >
                                            {action.label}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bank Account List */}
                    <BankAccountList />
                </div>

                {/* Income & Expenses Chart */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <Card className="h-full w-full p-5 text-white">
                        <CardHeader>
                            <CardTitle>Payout History</CardTitle>
                            <CardDescription className="text-gray-400">Financial overview for 2025</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableCaption>A list of your recent invoices.</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Amount</TableHead>
                                        <TableHead>Payout Date</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Reference Number</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice) => (
                                        <TableRow key={invoice.invoice}>
                                            <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                            <TableCell>{invoice.paymentStatus}</TableCell>
                                            <TableCell>{invoice.paymentMethod}</TableCell>
                                            <TableCell>{invoice.paymentMethod}</TableCell>
                                            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3}>Total</TableCell>
                                        <TableCell className="text-right">$2,500.00</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
