// table.tsx
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@headlessui/react';
import { Avatar } from '@radix-ui/react-avatar';
import { Checkbox } from '@radix-ui/react-checkbox';
import { Badge, Eye, MoreVertical, Trash } from 'lucide-react';
import React from 'react';

interface CustomTableProps {
    data: any[];
    selectedItems: string[];
    setSelectedItems: (items: string[]) => void;
    toggleItem: (id: string) => void;
    title: string;
    caption: string;
    headers: React.ReactNode[];
    additionalButton?: React.ReactNode; // Add optional button prop
    onView?: (item: any) => void; // Add optional view handler
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

const CustomTable: React.FC<CustomTableProps> = ({
    data,
    selectedItems,
    setSelectedItems,
    toggleItem,
    title,
    caption,
    headers,
    additionalButton,
    onView,
}) => {
    const toggleAll = () => {
        if (selectedItems.length === data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(data.map((item) => item.id));
        }
    };

    return (
        <Card className="bg-white p-4 shadow-sm dark:bg-zinc-800">
            <div className="flex items-center justify-between p-2">
                <h1>{title}</h1>
                {additionalButton}
            </div>
            <div className="w-full overflow-auto">
                <Table>
                    <TableCaption>{caption}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            {headers.map((header, index) => (
                                <TableHead key={index}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                <TableCell className="font-medium text-gray-900 md:table-cell dark:text-gray-100">{item.id}</TableCell>

                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                <div className="flex h-full w-full items-center justify-center text-gray-500 dark:text-gray-400">
                                                    {item.name.charAt(0)}
                                                </div>
                                            </div>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="truncate font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                                            <div className="truncate text-xs text-gray-500 md:text-sm dark:text-gray-400">{item.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium text-gray-900 md:table-cell dark:text-gray-100"></TableCell>
                                <TableCell className="hidden sm:table-cell">{item.email}</TableCell>
                                <TableCell>
                                    <Badge
                                        // Derive the status string from item.is_active for the getStatusBadge function
                                        className={`rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadge(item.is_active ? 'Active' : 'Inactive')}`}
                                    >
                                        {/* Derive the status string for display */}
                                        {item.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
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
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};

export default CustomTable;
