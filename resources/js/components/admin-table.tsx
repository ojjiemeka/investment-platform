import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar } from '@radix-ui/react-avatar';
import { Eye, MoreVertical, Pencil, Trash } from 'lucide-react';
import React from 'react';

interface TableDataItem {
    id: string;
    user_id: string;
    bank_account_id?: string;
    name: string;
    email: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    swift_code: string;
    iban: string;
    bank_address: string;
    is_primary: 'Yes' | 'No' | 'N/A';
    home_address: string;
    country: string;
    originalItem: any;
    is_active?: boolean;
    portfolios?: { id: number; balance: number }[];
    portfolios_count?: number;
    status?: string;
    total_balance?: number;
    originalAccount?: {
        id: string;
        bank_name: string;
        account_name: string;
        account_number: string;
        swift_code: string;
        iban: string;
        bank_address: string;
        is_primary: boolean;
    };
}

interface CustomTableProps {
    data: TableDataItem[];
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
    toggleItem: (id: string) => void;
    title: string;
    caption: string;
    additionalButton?: React.ReactNode;
    onView?: (user: any, bankAccountId?: string) => void;
    onEdit?: (item: TableDataItem) => void; // Updated to pass the entire item
    pageType: 'dashboard' | 'accounts';
    showViewButton?: boolean;
    showPagination?: boolean;
    pagination?: any;
    useInternalModal?: boolean;
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

const getTotalPortfolioBalance = (portfolios?: { id: number; balance: number }[]): number => {
    return portfolios?.reduce((total, portfolio) => total + (portfolio.balance || 0), 0) || 0;
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
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
    onEdit,
    pageType,
    showPagination,
    pagination,
    useInternalModal = false,
}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedItemForView, setSelectedItemForView] = React.useState<TableDataItem | null>(null);

    const handleViewClick = (item: TableDataItem) => {
        if (useInternalModal) {
            setSelectedItemForView(item);
            setIsModalOpen(true);
        }
        if (onView) {
            onView(item.originalItem, item.bank_account_id); // pass both user and account
        }
    };

    const handleEditClick = (item: TableDataItem) => {
        if (onEdit) {
            onEdit(item); // Pass the entire item to the parent's edit handler
        }
    };

    const getHeaders = () => {
        const baseHeaders = ['ID', 'User'];
        if (pageType === 'dashboard') {
            return [...baseHeaders, 'Portfolio Balance', 'Status', 'Actions'];
        } else if (pageType === 'accounts') {
            return [...baseHeaders, 'Bank Name', 'Account Name', 'Account Number', 'Primary', 'Actions'];
        }
        return baseHeaders;
    };

    const headers = getHeaders();

    return (
        <>
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
                                    <TableHead key={index} className="whitespace-nowrap">
                                        {header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => {
                                const totalBalance = getTotalPortfolioBalance(item.originalItem?.portfolios);
                                return (
                                    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </div>
                                                </Avatar>
                                                <div>
                                                    <div className="truncate font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                                    <div className="truncate text-xs text-gray-500 dark:text-gray-400">{item.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {pageType === 'dashboard' && (
                                            <>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{formatCurrency(item.total_balance ?? totalBalance)}</span>
                                                        {item.portfolios && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {item.portfolios.length} portfolio{item.portfolios.length !== 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(item.is_active ? 'Active' : 'Inactive')}`}
                                                    >
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                            </>
                                        )}

                                        {pageType === 'accounts' && (
                                            <>
                                                <TableCell>{item.bank_name}</TableCell>
                                                <TableCell>{item.account_name}</TableCell>
                                                <TableCell>{item.account_number}</TableCell>
                                                <TableCell>{item.is_primary}</TableCell>
                                            </>
                                        )}

                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewClick(item)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>
                                                    {onEdit && (
                                                        <DropdownMenuItem onClick={() => handleEditClick(item)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
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
                {showPagination && pagination && (
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {pagination.from} to {pagination.to} of {pagination.total} entries
                        </span>
                    </div>
                )}
            </Card>

            {useInternalModal && selectedItemForView && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-white dark:bg-zinc-800">
                        <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <p>
                                <strong>Name:</strong> {selectedItemForView.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {selectedItemForView.email}
                            </p>
                            <p>
                                <strong>Status:</strong> {selectedItemForView.is_active ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default CustomTable;
