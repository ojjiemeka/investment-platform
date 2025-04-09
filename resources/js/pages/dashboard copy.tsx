import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, FileText, Plus, TrendingUp } from 'lucide-react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

const actions = [
    { icon: <ArrowUpRight size={20} />, label: 'Send' },
    { icon: <ArrowDown size={20} />, label: 'Request' },
    { icon: <FileText size={20} />, label: 'Split bill' },
    { icon: <Plus size={20} />, label: 'Top up' },
];

// Sample financial data for the year
const financialData = [
    { month: 'Jan', income: 30000, expenses: 25000 },
    { month: 'Feb', income: 32000, expenses: 28000 },
    { month: 'Mar', income: 36000, expenses: 22000 },
    { month: 'Apr', income: 29000, expenses: 26000 },
    { month: 'May', income: 38000, expenses: 29000 },
    { month: 'Jun', income: 33800, expenses: 32600 },
    { month: 'Jul', income: 31000, expenses: 27000 },
    { month: 'Aug', income: 34000, expenses: 30000 },
    { month: 'Sep', income: 35000, expenses: 26000 },
    { month: 'Oct', income: 32000, expenses: 29000 },
    { month: 'Nov', income: 34000, expenses: 30000 },
    { month: 'Dec', income: 36000, expenses: 31000 },
];

const chartConfig = {
    income: {
        label: 'Income',
        color: 'hsl(var(--chart-1))',
    },
    expenses: {
        label: 'Expenses',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

export default function Dashboard({ totalBalance = 12500, percentageChange = 8.5 }) {
    // Format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Custom tooltip component to match the design in the image
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover p-4 rounded-lg shadow-lg border border-border">
                    <p className="font-medium mb-2">{label} 2024</p>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
                            <span className="text-sm">Income</span>
                            <span className="ml-auto font-medium">{formatCurrency(payload[0].value)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                            <span className="text-sm">Expenses</span>
                            <span className="ml-auto font-medium">{formatCurrency(payload[1].value)}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Financial Dashboard" />
            <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <Card className="h-full w-full justify-center py-8 text-center">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-gray-400">Total Balance</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="mb-1 text-3xl font-bold">
                                    {formatCurrency(totalBalance)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-zinc-900 p-4">
                            <div className="grid max-w-md grid-cols-4 gap-8">
                                {actions.map((action, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <button className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-black p-2 text-white transition-all duration-200 hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-lg">
                                            {action.icon}
                                        </button>
                                        <span className="text-center text-xs font-medium text-gray-300">{action.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                        <Card className="h-full w-full justify-between">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">June 2024</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))]"></div>
                                            <span className="text-sm">Income</span>
                                        </div>
                                        <span className="font-medium">{formatCurrency(33800.75)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]"></div>
                                            <span className="text-sm">Expenses</span>
                                        </div>
                                        <span className="font-medium">{formatCurrency(32600.89)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Income & Expenses</CardTitle>
                            <CardDescription>Financial overview for 2024</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={financialData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                    barSize={20}
                                    barGap={0}
                                >
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--color-muted-foreground)' }}
                                    />
                                    <YAxis 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--color-muted-foreground)' }}
                                        domain={[0, 'dataMax + 10000']}
                                        ticks={[0, 20000, 40000]} 
                                        tickFormatter={(value) => {
                                            return value === 0 ? '$0' : `$${value/1000}k`;
                                        }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={false} />
                                    <Bar 
                                        dataKey="income" 
                                        fill="hsl(var(--chart-1))" 
                                        radius={[4, 4, 0, 0]}
                                        background={{ fill: '#2a2a2a', radius: [4, 4, 4, 4] }}
                                    />
                                    <Bar 
                                        dataKey="expenses" 
                                        fill="hsl(var(--chart-2))" 
                                        radius={[0, 0, 4, 4]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-2 text-sm">
                            <div className="flex gap-2 leading-none font-medium">
                                <TrendingUp className="h-4 w-4" /> Income trending up by {percentageChange}% this month 
                            </div>
                            <div className="text-muted-foreground leading-none">Showing total income and expenses for 2024</div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}