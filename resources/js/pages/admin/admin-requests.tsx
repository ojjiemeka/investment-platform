import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, Building, CreditCard, Users, UsersIcon, Clock, CheckCircle, XCircle, Eye, User, X, Copy } from 'lucide-react';
import DashboardStats from '@/components/dashboardStats';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bank Account Requests',
        href: '/wallet/admin/requests',
    },
];

interface BankRequest {
    id: number;
    user_id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    swift_code: string;
    iban: string | null;
    bank_address: string;
    home_address: string;
    country: string;
    status?: 'pending' | 'approved' | 'rejected' | 'code_sent';
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface PaginatedBankRequests {
    data: BankRequest[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}

interface AdminRequestProps {
    bankRequests: PaginatedBankRequests;
    totalUsersCount: number;
    totalBankAccountsCount: number;
    pendingRequestsCount: number;
    totalPortfoliosCount?: number;
}

// Helper function to get status badge
const getStatusBadge = (status: string) => {
    const statusConfig = {
        pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' },
        code_sent: { color: 'bg-muted', icon: Clock, label: 'Code Sent' },
        approved: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved' },
        rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
        <Badge className={`${config.color} text-white hover:${config.color}`}>
            <config.icon className="h-3 w-3 mr-1" />
            {config.label}
        </Badge>
    );
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

// Helper function to group requests by date
const groupRequestsByDate = (requests: BankRequest[]) => {
    const groups: { [key: string]: BankRequest[] } = {};
    
    requests.forEach(request => {
        const date = new Date(request.created_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const requestDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        let groupKey: string;
        if (requestDate.getTime() === today.getTime()) {
            groupKey = 'Today';
        } else if (requestDate.getTime() === yesterday.getTime()) {
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
        groups[groupKey].push(request);
    });
    
    return groups;
};

export default function AdminRequests({
    bankRequests,
    totalUsersCount = 0,
    totalBankAccountsCount = 0,
    pendingRequestsCount = 0,
    totalPortfoliosCount,
}: AdminRequestProps) {
    
    const { props } = usePage();
    const groupedRequests = groupRequestsByDate(bankRequests.data || []);
    const totalRequests = bankRequests.data?.length || 0;

    // Modal state
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<BankRequest | null>(null);

    // Handle flash messages
    useEffect(() => {
        console.log('All props:', props);
        
        // Check for custom flash messages
        const flash = (props as any).flash;
        if (flash?.message) {
            console.log('Custom flash message found:', flash);
            
            // Override toast type based on message content for rejections
            const isRejection = flash.message.toLowerCase().includes('reject') || 
                               flash.message.toLowerCase().includes('denied') ||
                               flash.message.toLowerCase().includes('declined');
            
            if (flash.type === 'success' && isRejection) {
                // Override success type to error for rejection messages
                toast.error(flash.message, {
                    duration: 5000,
                });
            } else if (flash.type === 'success') {
                toast.success(flash.message, {
                    duration: 5000,
                });
            } else if (flash.type === 'error' || flash.type === 'danger') {
                toast.error(flash.message, {
                    duration: 5000,
                });
            } else {
                // Fallback - show as info toast
                toast(flash.message, {
                    duration: 5000,
                });
            }
        }
        
        // Check for session flash messages
        const success = (props as any).success;
        const error = (props as any).error;
        
        if (success) {
            console.log('Session success message found:', success);
            // Check if success message is actually a rejection
            const isRejection = success.toLowerCase().includes('reject') || 
                               success.toLowerCase().includes('denied') ||
                               success.toLowerCase().includes('declined');
            
            if (isRejection) {
                toast.error(success, {
                    duration: 5000,
                });
            } else {
                toast.success(success, {
                    duration: 5000,
                });
            }
        }
        
        if (error) {
            console.log('Session error message found:', error);
            toast.error(error, {
                duration: 5000,
            });
        }
        
        if (!flash?.message && !success && !error) {
            console.log('No flash messages found in props');
        }
    }, [props]);

    const handleApprove = (requestId: number, userId: number) => {
        console.log('status: code sent');
        console.log('user_id:', userId);
        console.log('selected request ID:', requestId);
        
        // PUT request to update the bank request status
        router.put(`/wallet/admin/bank-requests/${requestId}`, {
            status: 'code_sent'
        }, {
            onSuccess: () => {
                console.log('Request approved successfully');
                // Close modal if it's open
                setIsViewModalOpen(false);
                setSelectedRequest(null);
            },
            onError: (errors) => {
                console.error('Failed to approve request:', errors);
            }
        });
    };

    const handleReject = (requestId: number, userId: number) => {
        console.log('status: rejected');
        console.log('user_id:', userId);
        console.log('selected request ID:', requestId);
        
        // PUT request to update the bank request status
        router.put(`/wallet/admin/bank-requests/${requestId}`, {
            status: 'rejected'
        }, {
            onSuccess: () => {
                console.log('Request rejected successfully');
                // Show danger toast for rejection
                toast.error('Request has been rejected', {
                    duration: 5000,
                });
                // Close modal if it's open
                setIsViewModalOpen(false);
                setSelectedRequest(null);
            },
            onError: (errors) => {
                console.error('Failed to reject request:', errors);
                toast.error('Failed to reject request. Please try again.', {
                    duration: 5000,
                });
            }
        });
    };

    const handleView = (requestId: number, userId: number) => {
        console.log('View request details:', requestId);
        console.log('user_id:', userId);
        
        // Find the request in the data
        const request = bankRequests.data.find(req => req.id === requestId);
        if (request) {
            setSelectedRequest(request);
            setIsViewModalOpen(true);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!', { duration: 2000 });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const dashboardStats = [
        {
            title: 'Total Users',
            value: totalUsersCount.toLocaleString(),
            change: '+47',
            icon: UsersIcon,
            positive: true,
        },
        {
            title: 'Total Bank Requests',
            value: totalBankAccountsCount.toLocaleString(),
            change: '+72',
            icon: CreditCard,
            positive: true,
        },
        {
            title: 'Pending Requests',
            value: pendingRequestsCount.toLocaleString(),
            change: '-49',
            icon: AlertCircle,
            positive: false,
        },
        ...(totalPortfoliosCount !== undefined
            ? [
                  {
                      title: 'Total Portfolios',
                      value: totalPortfoliosCount.toLocaleString(),
                      change: '+15',
                      icon: Building,
                      positive: true,
                  },
              ]
            : []),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Account Requests" />
            <Toaster 
                theme="dark" 
                position="top-right" 
                closeButton
                richColors
            />
            
            <div className="flex h-full flex-col gap-4 md:gap-6 p-2 md:p-4 lg:p-6">
                {/* Dashboard Stats */}
                <DashboardStats stats={dashboardStats} />
                
                {/* Bank Requests Section */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-lg md:rounded-xl border">
                    <Card className="w-full p-2 sm:p-3 md:p-6 text-white">
                        {/* Header */}
                        <div className="flex flex-col gap-3 mb-4 md:mb-6">
                            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-1 md:mb-2 leading-tight">
                                        Bank Account Requests
                                    </h1>
                                    <p className="text-gray-400 text-xs sm:text-sm">
                                        {totalRequests} request{totalRequests !== 1 ? 's' : ''} to review
                                    </p>
                                </div>
                                <div className="flex gap-1 sm:gap-2 w-full xs:w-auto flex-shrink-0">
                                    <Button variant="outline" className="text-green-400 border-green-400 hover:bg-green-50 flex-1 xs:flex-none text-xs px-2 sm:px-3 py-1.5 sm:py-2">
                                        <span className="hidden xs:inline">Approve All</span>
                                        <span className="xs:hidden">✓ All</span>
                                    </Button>
                                    <Button variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-50 flex-1 xs:flex-none text-xs px-2 sm:px-3 py-1.5 sm:py-2">
                                        <span className="hidden xs:inline">Export</span>
                                        <span className="xs:hidden">Export</span>
                                    </Button>
                                    {/* DEBUG: Test Toast Button */}
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            console.log('🧪 Test button clicked');
                                            toast.success('Test Toast Working!', { duration: 3000 });
                                        }}
                                        className="text-purple-400 border-purple-400 hover:bg-purple-50 flex-1 xs:flex-none text-xs px-2 sm:px-3 py-1.5 sm:py-2"
                                    >
                                        Test Toast
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            {Object.keys(groupedRequests).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-300 mb-2">No bank requests yet</h3>
                                    <p className="text-gray-400 text-center">
                                        When users submit bank account requests, they'll appear here.
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedRequests).map(([dateGroup, groupRequests]) => (
                                    <div key={dateGroup} className="mb-8">
                                        {/* Date Group Header */}
                                        <h2 className="text-xs sm:text-sm font-medium text-gray-300 mb-2 md:mb-4 px-1">
                                            {dateGroup}
                                        </h2>
                                        
                                        {/* Requests in this group */}
                                        <div className="space-y-2 md:space-y-1">
                                            {groupRequests.map((request) => {
                                                const timeAgo = formatTime(request.created_at);
                                                
                                                return (
                                                    <div 
                                                        key={request.id}
                                                        className="flex flex-col xs:flex-row xs:items-start gap-2 p-2 sm:p-3 md:p-4 rounded-md md:rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-700/50"
                                                    >
                                                        {/* Mobile-First Layout */}
                                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                                            {/* User Icon */}
                                                            <div className="flex-shrink-0">
                                                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-md md:rounded-lg flex items-center justify-center text-blue-400">
                                                                    <User className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-col gap-1">
                                                                    {/* Title and Status */}
                                                                    <div className="flex flex-col xs:flex-row xs:items-start gap-1 xs:gap-2">
                                                                        <h3 className="font-medium text-white text-xs sm:text-sm md:text-base leading-tight flex-1 min-w-0 break-words">
                                                                            {request.bank_name} Account Request
                                                                        </h3>
                                                                        <div className="flex-shrink-0">
                                                                            {getStatusBadge(request.status)}
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* From */}
                                                                    <p className="text-xs text-gray-400 mb-1 break-words leading-tight">
                                                                        <strong>From:</strong> {request.user.name}<br className="xs:hidden" />
                                                                        <span className="hidden xs:inline"> (</span><span className="xs:hidden">Email: </span>{request.user.email}<span className="hidden xs:inline">)</span>
                                                                    </p>
                                                                    
                                                                    {/* Details Grid - Stack on very small screens */}
                                                                    <div className="flex flex-col xs:grid xs:grid-cols-2 gap-0.5 xs:gap-1 text-xs text-gray-400 mb-1">
                                                                        <span className="truncate"><strong>Account:</strong> {request.account_name}</span>
                                                                        <span><strong>Currency:</strong> {request.currency}</span>
                                                                        <span><strong>Country:</strong> {request.country}</span>
                                                                        <span><strong>Account #:</strong> ...{request.account_number.slice(-4)}</span>
                                                                    </div>
                                                                    
                                                                    {/* Timestamp */}
                                                                    <span className="text-xs text-gray-500 block">
                                                                        {timeAgo} • ID: #{request.id}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Action Buttons - Always below on mobile, right side on desktop */}
                                                        <div className="w-full xs:w-auto xs:flex-shrink-0">
                                                            {/* Mobile Buttons - Full Width */}
                                                            <div className="flex gap-1 xs:hidden w-full">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => handleView(request.id, request.user_id)}
                                                                    className="text-blue-400 border-blue-400 hover:bg-blue-400/10 flex-1 text-xs py-1.5 px-2"
                                                                >
                                                                    <Eye className="h-3 w-3 mr-1" />
                                                                    View
                                                                </Button>
                                                                
                                                                {request.status === 'pending' && (
                                                                    <>
                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="sm"
                                                                            onClick={() => handleApprove(request.id, request.user_id)}
                                                                            className="text-green-400 border-green-400 hover:bg-green-400/10 flex-1 text-xs py-1.5 px-2"
                                                                        >
                                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                                            <span className="hidden xxs:inline">Approve</span>
                                                                            <span className="xxs:hidden">✓</span>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline" 
                                                                            size="sm"
                                                                            onClick={() => handleReject(request.id, request.user_id)}
                                                                            className="text-red-400 border-red-400 hover:bg-red-400/10 flex-1 text-xs py-1.5 px-2"
                                                                        >
                                                                            <XCircle className="h-3 w-3 mr-1" />
                                                                            <span className="hidden xxs:inline">Reject</span>
                                                                            <span className="xxs:hidden">✗</span>
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Desktop Buttons - Right Side */}
                                                            <div className="hidden xs:flex md:gap-2 gap-1 flex-shrink-0">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleView(request.id, request.user_id)}
                                                                    className="text-blue-400 hover:text-blue-300"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
                                                                
                                                                {request.status === 'pending' && (
                                                                    <>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => handleApprove(request.id, request.user_id)}
                                                                            className="text-green-400 hover:text-green-300"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                                            Approve
                                                                        </Button>
                                                                        <Button 
                                                                            variant="ghost" 
                                                                            size="sm"
                                                                            onClick={() => handleReject(request.id, request.user_id)}
                                                                            className="text-red-400 hover:text-red-300"
                                                                        >
                                                                            <XCircle className="h-4 w-4 mr-1" />
                                                                            Reject
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

            {/* View Request Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-400" />
                            Bank Account Request Details
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {selectedRequest && `Request #${selectedRequest.id} • Submitted ${formatDate(selectedRequest.created_at)}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6 mt-4">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Status:</span>
                                    {getStatusBadge(selectedRequest.status)}
                                </div>
                                <div className="flex gap-2">
                                    {selectedRequest.status === 'pending' && (
                                        <>
                                            <Button
                                                onClick={() => handleApprove(selectedRequest.id, selectedRequest.user_id)}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                size="sm"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={() => handleReject(selectedRequest.id, selectedRequest.user_id)}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-gray-700" />

                            {/* Applicant Information */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-400" />
                                    Applicant Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Full Name:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white">{selectedRequest.user.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedRequest.user.name)}
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Email:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white">{selectedRequest.user.email}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedRequest.user.email)}
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">User ID:</span>
                                            <span className="text-white">#{selectedRequest.user_id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-700" />

                            {/* Bank Account Details */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-blue-400" />
                                    Bank Account Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Bank Name:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{selectedRequest.bank_name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedRequest.bank_name)}
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Account Holder:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white">{selectedRequest.account_name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedRequest.account_name)}
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Account Number:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-mono">...{selectedRequest.account_number.slice(-4)}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedRequest.account_number)}
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Currency:</span>
                                            <span className="text-white">{selectedRequest.currency}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Country:</span>
                                            <span className="text-white">{selectedRequest.country}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">SWIFT Code:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-mono">{selectedRequest.swift_code || 'N/A'}</span>
                                                {selectedRequest.swift_code && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(selectedRequest.swift_code)}
                                                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">IBAN:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-mono">{selectedRequest.iban || 'N/A'}</span>
                                                {selectedRequest.iban && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(selectedRequest.iban)}
                                                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-700" />

                            {/* Address Information */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-blue-400" />
                                    Address Information
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <span className="text-sm text-gray-400 block mb-1">Bank Address:</span>
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-white text-sm leading-relaxed">{selectedRequest.bank_address || 'Not provided'}</span>
                                            {selectedRequest.bank_address && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedRequest.bank_address)}
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white flex-shrink-0"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-400 block mb-1">Home Address:</span>
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-white text-sm leading-relaxed">{selectedRequest.home_address || 'Not provided'}</span>
                                            {selectedRequest.home_address && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(selectedRequest.home_address)}
                                                    className="h-6 w-6 p-0 text-gray-400 hover:text-white flex-shrink-0"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-700" />

                            {/* Request Metadata */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                    Request Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Request ID:</span>
                                            <span className="text-white">#{selectedRequest.id}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Submitted:</span>
                                            <span className="text-white text-sm">{formatDate(selectedRequest.created_at)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Last Updated:</span>
                                            <span className="text-white text-sm">{formatDate(selectedRequest.updated_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}