import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, DollarSign, MoreHorizontal, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Define TypeScript interfaces for type safety
interface DashboardProps {
    totalRevenue?: number;
    percentageChange?: number;
}

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


// Updated chart data to include income and expenses for all months
const financialData = [
    { month: 'Jan', income: 25000, expenses: 20000 },
    { month: 'Feb', income: 27000, expenses: 22000 },
    { month: 'Mar', income: 30000, expenses: 21000 },
    { month: 'Apr', income: 26500, expenses: 22500 },
    { month: 'May', income: 32000, expenses: 25000 },
    { month: 'Jun', income: 30500, expenses: 26000 },
    { month: 'Jul', income: 28000, expenses: 24000 },
    { month: 'Aug', income: 29500, expenses: 25500 },
    { month: 'Sep', income: 30000, expenses: 24000 },
    { month: 'Oct', income: 29000, expenses: 25000 },
    { month: 'Nov', income: 30500, expenses: 26000 },
    { month: 'Dec', income: 32000, expenses: 27000 },
];



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

export default function Index({ totalRevenue = 24320.75, percentageChange = 35 }: DashboardProps) {
    // Format currency
    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2,
        }).format(value);
    };

    // Financial card component with icon, title, value and percentage
    const FinancialCard = ({ title, value, change, icon }: { title: string; value: number; change: number; icon: React.ReactNode }) => {
        return (
            <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                <Card className="h-full w-full">
                    <CardContent className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-green-500 p-2">{icon}</div>
                                <h3 className="text-lg font-medium">{title}</h3>
                            </div>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-2xl font-bold">{formatCurrency(value)}</p>
                                <p className="text-muted-foreground text-sm">vs last month</p>
                            </div>
                            {change > 0 && <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">+{change}%</div>}
                            {change < 0 && <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">{change}%</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Bank account list component
const BankAccountList = () => {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border">
            <Card className="h-full w-full py-0">
                <CardContent className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Bank Account</h3>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    {/* Scrollable container with explicit height and overflow properties */}
                    <div className="max-h-48 overflow-y-auto custom-scrollbar flex-1 mb-4" style={{ scrollbarWidth: 'thin' }}>
                        <div className="space-y-4">
                            {bankAccounts.map((account, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                            {/* Placeholder for bank logo */}
                                            {typeof account.logo === 'string' ? account.logo : 'B'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{account.name}</p>
                                            <p className="text-sm text-muted-foreground">{formatCurrency(account.amount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                        <span className="text-xs text-muted-foreground">{account.status}</span>
                                    </div>
                                </div>
                            ))}
                            
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                        BofA
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Bank of America</p>
                                        <p className="text-sm text-muted-foreground">{formatCurrency(12345.67)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                    <span className="text-xs text-muted-foreground">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-auto">
                        Connect Bank
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

    const moneyIn = 14320.75;
    const moneyOut = 9320.75;
    const totalSaving = 12678.0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
          <Head title="Wallet" />
          <div className="flex h-full flex-col gap-4 rounded-xl p-4">
            
            {/* First row of cards */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* My Balance */}
                    <div>
                        <div className="mb-4">
                            <FinancialCard
                                title="My Balance"
                                value={totalRevenue}
                                change={percentageChange}
                                icon={<DollarSign size={20} className="text-white" />}
                            />
                        </div>
                        <div>
                            <FinancialCard
                                title="Total Savings"
                                value={totalSaving}
                                change={18} // Example percentage
                                icon={<TrendingUp size={20} className="text-white" />}
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}

                    <div>
                        <div className="mb-4">
                            <FinancialCard
                                title="Money In"
                                value={moneyIn}
                                change={percentageChange}
                                icon={<ArrowDown size={20} className="text-white" />}
                            />
                        </div>
                        <div>
                            <FinancialCard
                                title="Money Out"
                                value={moneyOut}
                                change={percentageChange}
                                icon={<ArrowUpRight size={20} className="text-white" />}
                            />
                        </div>
                    </div>

                    {/* Bank Account List */}
                    <BankAccountList />
                </div>
      
            {/* Income & Expenses Chart */}
            <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
              <Card className="h-full w-full bg-black text-white">
                <CardHeader>
                  <CardTitle>Income & Expenses</CardTitle>
                  <CardDescription className="text-gray-400">Financial overview for 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={financialData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        stroke="#ccc"
                      />
                      <YAxis stroke="#ccc" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: 'none' }}
                        labelStyle={{ color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="income" fill="#22c55e" name="Income" />
                      <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </AppLayout>
      );
      
}
