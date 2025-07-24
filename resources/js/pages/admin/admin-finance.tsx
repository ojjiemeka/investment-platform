import BackButton from '@/components/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { 
    ArrowUpRight, ArrowDownLeft, Eye, Copy, Clock, Shield, 
    User, CreditCard, DollarSign, TrendingUp, TrendingDown,
    CheckCircle, XCircle, AlertCircle, Filter, Search
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    member_since: string;
    initials: string;
}

interface BankAccount {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    is_primary: boolean;
    masked_account: string;
}

interface History {
    id: number;
    user_id: number;
    type: string;
    amount: number;
    status: string;
    bank_account_id: number | null;
    created_at: string;
    updated_at: string;
    user: User | null;
    bank_account: BankAccount | null;
    formatted_amount: string;
    currency_symbol: string;
    formatted_date: string;
    time_ago: string;
    status_color: string;
    type_color: string;
    display_title: string;
    display_description: string;
}

interface Statistics {
    total_transactions: number;
    total_deposits: number;
    total_withdrawals: number;
    net_flow: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    unique_users: number;
}

interface PortfolioProps {
    histories: History[];
    statistics: Statistics;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/wallet/admin/dashboard',
    },
    {
        title: 'Portfolios',
        href: '/wallet/admin/portfolios',
    },
];

// Helper function to get transaction icon based on type and status
const getTransactionIcon = (history: History) => {
    if (history.type === 'deposit') {
        return <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />;
    } else {
        return <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />;
    }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
    switch (status) {
        case 'approved':
            return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />;
        case 'rejected':
            return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />;
        case 'pending':
            return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />;
        default:
            return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />;
    }
};

// Helper function to format time
const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
};

// Helper function to format full date
const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Helper function to group transactions by date
const groupTransactionsByDate = (histories: History[]) => {
    const groups: { [key: string]: History[] } = {};
    
    histories.forEach(history => {
        const date = new Date(history.created_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        let groupKey: string;
        if (transactionDate.getTime() === today.getTime()) {
            groupKey = 'Today';
        } else if (transactionDate.getTime() === yesterday.getTime()) {
            groupKey = 'Yesterday';
        } else {
            groupKey = date.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short' 
            });
        }
        
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(history);
    });
    
    return groups;
};

export default function AdminPortfolios({ histories = [], statistics }: PortfolioProps) {
    const { props } = usePage();
    const [filteredHistories, setFilteredHistories] = useState(histories);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<History | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle flash messages from backend
    useEffect(() => {
        console.log('🔍 Checking for flash messages:', props);
        
        const flash = (props as any).flash;
        if (flash?.message) {
            console.log('📨 Flash message received:', flash);
            
            if (flash.type === 'success') {
                toast.success(flash.message, {
                    duration: 5000,
                });
            } else if (flash.type === 'error') {
                toast.error(flash.message, {
                    duration: 5000,
                });
            }
        }
    }, [props]);

    // Filter histories based on type, status, and search term
    useEffect(() => {
        let filtered = histories;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(h => h.type === filterType);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(h => h.status === filterStatus);
        }

        // Filter by search term (user name or email)
        if (searchTerm) {
            filtered = filtered.filter(h => 
                h.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.bank_account?.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredHistories(filtered);
    }, [histories, filterType, filterStatus, searchTerm]);

    const groupedHistories = groupTransactionsByDate(filteredHistories);
    const totalTransactions = filteredHistories.length;

    const handleViewTransaction = (history: History) => {
        console.log('🔍 Transaction clicked - VIEW DETAILS', history);
        setSelectedHistory(history);
        setIsViewModalOpen(true);
    };

    const handleActionClick = (history: History, action: 'approve' | 'reject') => {
        console.log('⚡ Action clicked:', action, history);
        setSelectedHistory(history);
        setActionType(action);
        setIsActionModalOpen(true);
    };

    const handleSubmitAction = () => {
        if (!selectedHistory || !actionType) return;

        console.log(`🔄 Submitting ${actionType} for transaction:`, selectedHistory.id);
        setIsSubmitting(true);

        router.post('/admin/update-transaction-status', {
            transaction_id: selectedHistory.id,
            status: actionType === 'approve' ? 'approved' : 'rejected',
            type: selectedHistory.type
        }, {
            onSuccess: () => {
                console.log('✅ Transaction status updated successfully');
                setIsSubmitting(false);
                setIsActionModalOpen(false);
                setSelectedHistory(null);
                setActionType(null);
                // Flash message will be handled by useEffect
            },
            onError: (errors) => {
                console.error('❌ Failed to update transaction status:', errors);
                setIsSubmitting(false);
                // Flash error message will be handled by useEffect
            },
            onFinish: () => {
                console.log('🏁 Transaction status update completed');
                setIsSubmitting(false);
            }
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!', { duration: 2000 });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Portfolios - Transaction History" />
            <Toaster 
                theme="dark" 
                position="top-right" 
                closeButton
                richColors
            />
            <BackButton/>
            
            <div className="flex h-full flex-col gap-4 rounded-xl p-2 sm:p-4">
                {/* Mobile-Optimized Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-3 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <DollarSign className="h-4 w-4 text-blue-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="text-lg sm:text-2xl font-bold text-white">{statistics.total_transactions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-3 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Deposits</p>
                                    <p className="text-sm sm:text-xl font-bold text-green-400">${statistics.total_deposits.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-3 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <TrendingDown className="h-4 w-4 text-blue-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Withdrawals</p>
                                    <p className="text-sm sm:text-xl font-bold text-blue-400">${statistics.total_withdrawals.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-zinc-900 border-zinc-700">
                        <CardContent className="p-3 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Pending</p>
                                    <p className="text-lg sm:text-2xl font-bold text-yellow-400">{statistics.pending_count}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <Card className="h-full w-full p-3 sm:p-6 text-white bg-zinc-900 border-zinc-700">
                        {/* Mobile-Optimized Header with Filters */}
                        <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2">Transaction History</h1>
                                <p className="text-sm text-gray-400">
                                    {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''} found
                                </p>
                            </div>
                            
                            {/* Mobile-First Filters */}
                            <div className="space-y-3">
                                {/* Search Bar - Full Width on Mobile */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search users, banks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-zinc-800 border-zinc-600 text-white pl-10 h-10"
                                    />
                                </div>
                                
                                {/* Filter Dropdowns - Side by Side on Mobile */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Select value={filterType} onValueChange={setFilterType}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white h-10">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-600">
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="deposit">Deposits</SelectItem>
                                            <SelectItem value="withdrawal">Withdrawals</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white h-10">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-600">
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            {Object.keys(groupedHistories).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-300 mb-2">No transactions found</h3>
                                    <p className="text-gray-400 text-center text-sm">
                                        No transactions match your current filters.
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedHistories).map(([dateGroup, groupTransactions]) => (
                                    <div key={dateGroup} className="mb-6 sm:mb-8">
                                        {/* Date Group Header */}
                                        <h2 className="text-sm font-medium text-gray-300 mb-3 sm:mb-4 px-1">
                                            {dateGroup}
                                        </h2>
                                        
                                        {/* Mobile-Optimized Transaction List */}
                                        <div className="space-y-2 sm:space-y-1">
                                            {groupTransactions.map((history) => {
                                                const icon = getTransactionIcon(history);
                                                const statusIcon = getStatusIcon(history.status);
                                                const timeAgo = formatTime(history.created_at);
                                                
                                                return (
                                                    <div 
                                                        key={history.id}
                                                        className="flex flex-col p-3 sm:p-4 rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-700/50 group space-y-3"
                                                    >
                                                        {/* Mobile: Top Row - User & Amount */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                                                    <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">
                                                                        {history.user?.initials || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        {icon}
                                                                        <h3 className="font-medium text-white text-sm leading-tight truncate">
                                                                            {history.user?.name || 'Unknown User'}
                                                                        </h3>
                                                                    </div>
                                                                    <p className="text-xs text-gray-400 truncate">
                                                                        {history.user?.email}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Amount - Right Aligned */}
                                                            <div className="text-right flex-shrink-0">
                                                                <div className={`text-lg font-semibold ${
                                                                    history.type === 'deposit' ? 'text-green-400' : 'text-blue-400'
                                                                }`}>
                                                                    {history.type === 'deposit' ? '+' : '-'}{history.currency_symbol}{history.formatted_amount}
                                                                </div>
                                                                <div className="text-xs text-gray-500 uppercase">
                                                                    {history.bank_account?.currency || 'USD'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Mobile: Middle Row - Transaction Details */}
                                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                                    history.status === 'approved' ? 'bg-green-600/20 text-green-400' :
                                                                    history.status === 'rejected' ? 'bg-red-600/20 text-red-400' :
                                                                    'bg-yellow-600/20 text-yellow-400'
                                                                }`}>
                                                                    {history.status}
                                                                </span>
                                                                <span className="capitalize">{history.type}</span>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{timeAgo}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Mobile: Bottom Row - Bank Info & Actions */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                {history.bank_account && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <CreditCard className="h-3 w-3" />
                                                                        <span className="truncate">
                                                                            {history.bank_account.bank_name} {history.bank_account.masked_account}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Mobile-Optimized Action Buttons */}
                                                            <div className="flex gap-1 flex-shrink-0">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleViewTransaction(history)}
                                                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-8 w-8 p-0"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                
                                                                {history.status === 'pending' && (
                                                                    <>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => handleActionClick(history, 'approve')}
                                                                            className="text-green-400 hover:text-green-300 hover:bg-green-400/10 h-8 w-8 p-0"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => handleActionClick(history, 'reject')}
                                                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 p-0"
                                                                        >
                                                                            <XCircle className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Mobile-Optimized View Transaction Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700 mx-2">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                            Transaction Details
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 text-sm">
                            {selectedHistory && `Transaction #${selectedHistory.id} • ${formatFullDate(selectedHistory.created_at)}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedHistory && (
                        <div className="space-y-4 sm:space-y-6 mt-4">
                            {/* Mobile-Optimized Transaction Overview */}
                            <div className="grid grid-cols-1 gap-4">
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm text-gray-300">Transaction Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Type:</span>
                                            <span className="text-white capitalize">{selectedHistory.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Amount:</span>
                                            <span className={`font-semibold ${
                                                selectedHistory.type === 'deposit' ? 'text-green-400' : 'text-blue-400'
                                            }`}>
                                                {selectedHistory.currency_symbol}{selectedHistory.formatted_amount}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Status:</span>
                                            <span className={`capitalize ${
                                                selectedHistory.status === 'approved' ? 'text-green-400' :
                                                selectedHistory.status === 'rejected' ? 'text-red-400' :
                                                'text-yellow-400'
                                            }`}>
                                                {selectedHistory.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Created:</span>
                                            <span className="text-white text-sm">{selectedHistory.formatted_date}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm text-gray-300">User Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Name:</span>
                                            <span className="text-white">{selectedHistory.user?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Email:</span>
                                            <span className="text-white text-sm break-all">{selectedHistory.user?.email || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Member Since:</span>
                                            <span className="text-white text-sm">{selectedHistory.user?.member_since || 'N/A'}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Bank Account Info (for withdrawals) */}
                            {selectedHistory.bank_account && (
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm text-gray-300">Bank Account Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Bank:</span>
                                            <span className="text-white">{selectedHistory.bank_account.bank_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Account Name:</span>
                                            <span className="text-white">{selectedHistory.bank_account.account_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Account:</span>
                                            <span className="text-white">{selectedHistory.bank_account.masked_account}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Currency:</span>
                                            <span className="text-white">{selectedHistory.bank_account.currency}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Mobile-Optimized Actions for Pending Transactions */}
                            {selectedHistory.status === 'pending' && (
                                <>
                                    <Separator className="bg-gray-700" />
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            onClick={() => {
                                                setIsViewModalOpen(false);
                                                handleActionClick(selectedHistory, 'approve');
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve Transaction
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setIsViewModalOpen(false);
                                                handleActionClick(selectedHistory, 'reject');
                                            }}
                                            variant="outline"
                                            className="border-red-600 text-red-400 hover:bg-red-600/10 w-full sm:w-auto"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject Transaction
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Mobile-Optimized Action Confirmation Modal */}
            <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-md bg-gray-900 text-white border-gray-700 mx-2">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                            {actionType === 'approve' ? (
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                            ) : (
                                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                            )}
                            {actionType === 'approve' ? 'Approve' : 'Reject'} Transaction
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 text-sm">
                            This action cannot be undone. Please confirm your decision.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedHistory && (
                        <div className="space-y-4 mt-4">
                            <div className="bg-gray-800 rounded-lg p-4">
                                <h3 className="font-medium text-white mb-2">Transaction Summary</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">User:</span>
                                        <span className="text-white">{selectedHistory.user?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Type:</span>
                                        <span className="text-white capitalize">{selectedHistory.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Amount:</span>
                                        <span className="text-white font-semibold">
                                            {selectedHistory.currency_symbol}{selectedHistory.formatted_amount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={handleSubmitAction}
                                    disabled={isSubmitting}
                                    className={`w-full sm:flex-1 ${
                                        actionType === 'approve' 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-red-600 hover:bg-red-700'
                                    } text-white`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {actionType === 'approve' ? (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            ) : (
                                                <XCircle className="h-4 w-4 mr-2" />
                                            )}
                                            {actionType === 'approve' ? 'Approve' : 'Reject'}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsActionModalOpen(false)}
                                    disabled={isSubmitting}
                                    className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}