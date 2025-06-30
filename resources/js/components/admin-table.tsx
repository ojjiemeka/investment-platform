import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar } from '@radix-ui/react-avatar';
import { Checkbox } from '@radix-ui/react-checkbox';
import { Badge, Eye, MoreVertical, Trash } from 'lucide-react';
import React from 'react';

interface Portfolio {
    id: number;
    balance: number;
}

interface BankAccount {
    user_id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    swift_code: string;
    iban?: string;
    bank_address?: string;
    is_primary: boolean;
    status: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    portfolios: Portfolio[];
    portfolios_count?: number;
    bank_accounts?: BankAccount[];
    home_address?: string;
    country?: string;
}

interface CustomTableProps {
    data: UserItem[];
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
    toggleItem: (id: string) => void;
    title: string;
    caption: string;
    additionalButton?: React.ReactNode;
    onView?: (item: any) => void;
    pageType: 'dashboard' | 'accounts'; // New prop to determine which columns to show
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Active':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border border-green-500';
        case 'Inactive':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border border-red-500';
        case 'Onboarding':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-500';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
};

// Helper function to calculate total portfolio balance
const getTotalPortfolioBalance = (portfolios: Portfolio[]): number => {
    return portfolios?.reduce((total, portfolio) => total + (portfolio.balance || 0), 0) || 0;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
};

const CustomTable: React.FC<CustomTableProps> = ({
    data,
    selectedItems,
    setSelectedItems,
    toggleItem,
    title,
    caption,
    additionalButton,
    onView,
    pageType,
}) => {
    const toggleAll = () => {
        if (selectedItems.length === data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(data.map((item) => item.id.toString()));
        }
    };

    // Define headers based on page type
    const getHeaders = () => {
        const baseHeaders = ['ID', 'User'];
        
        if (pageType === 'dashboard') {
            return [...baseHeaders, 'Portfolio Balance', 'Portfolio Count', 'Status', 'Actions'];
        } else if (pageType === 'accounts') {
            return [...baseHeaders, 'Bank Name', 'Account Number', 'Bank Address', 'Home Address', 'Country', 'Actions'];
        }
        
        return baseHeaders;
    };

    const headers = getHeaders();

    return (
        <Card className="bg-white p-4 shadow-sm dark:bg-zinc-800">
            <div className="flex items-center justify-between p-2">
                <h1>{title}</h1>
                {additionalButton}
            </div>
            <div className="w-full overflow-x-auto">
                <Table>
                    <TableCaption>{caption}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableHead key={index} className="whitespace-nowrap">{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => {
                            const totalBalance = getTotalPortfolioBalance(item.portfolios);
                            const primaryBankAccount = item.bank_accounts?.find(account => account.is_primary)
                                || item.bank_accounts?.[0]; // Fallback to first if no primary

                            return (
                                <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                    {/* ID Column - Always shown */}
                                    <TableCell className="font-medium text-gray-900 md:table-cell dark:text-gray-100 whitespace-nowrap">
                                        {item.id}
                                    </TableCell>

                                    {/* User Column - Always shown */}
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                                                    {item.name}
                                                </div>
                                                <div className="truncate text-xs text-gray-500 md:text-sm dark:text-gray-400">
                                                    {item.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Dashboard-specific columns */}
                                    {pageType === 'dashboard' && (
                                        <>
                                            {/* Portfolio Balance Column */}
                                            <TableCell className="font-medium text-gray-900 md:table-cell dark:text-gray-100 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {formatCurrency(totalBalance)}
                                                    </span>
                                                    {item.portfolios && item.portfolios.length > 0 && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.portfolios.length} portfolio{item.portfolios.length !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Portfolio Count Column */}
                                            <TableCell className="hidden sm:table-cell whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {item.portfolios?.length || 0}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Active portfolios
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Status Column */}
                                            <TableCell className="whitespace-nowrap">
                                                <Badge
                                                    className={`rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadge(item.is_active ? 'Active' : 'Inactive')}`}
                                                >
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                        </>
                                    )}

                                    {/* Accounts-specific columns */}
                                    {pageType === 'accounts' && (
                                        <>
                                            {/* Bank Name Column */}
                                            <TableCell className="whitespace-nowrap">
                                                {primaryBankAccount?.bank_name || 'N/A'}
                                            </TableCell>

                                            {/* Account Number Column */}
                                            <TableCell className="whitespace-nowrap">
                                                {primaryBankAccount?.account_number || 'N/A'}
                                            </TableCell>

                                            {/* Bank Address Column */}
                                            <TableCell className="whitespace-nowrap">
                                                {primaryBankAccount?.bank_address || 'N/A'}
                                            </TableCell>

                                            {/* Home Address Column */}
                                            <TableCell className="whitespace-nowrap">
                                                {item.home_address || 'N/A'}
                                            </TableCell>

                                            {/* Country Column */}
                                            <TableCell className="whitespace-nowrap">
                                                {item.country || 'N/A'}
                                            </TableCell>
                                        </>
                                    )}

                                    {/* Actions Column - Always shown */}
                                    <TableCell className="whitespace-nowrap">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-36">
                                                <DropdownMenuItem
                                                    className="flex cursor-pointer items-center gap-2"
                                                    onClick={() => onView && onView(item)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View & Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="flex cursor-pointer items-center gap-2 text-red-600 dark:text-red-400">
                                                    <Trash className="h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};

export default CustomTable;