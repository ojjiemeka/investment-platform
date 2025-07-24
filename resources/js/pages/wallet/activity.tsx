import BackButton from '@/components/back-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Bell, CreditCard, UserPlus, FileText, TrendingUp, Eye, Copy, Clock, Shield, Key } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

interface Notification {
    id: number;
    message: string;
    to_user_id: number;
    created_at: string;
    updated_at: string;
}

interface ActivityProps {
    notifications: Notification[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity',
        href: '/activity',
    },
];

// Helper function to get notification icon based on content
const getNotificationIcon = (message: string) => {
    if (message.includes('Bank Account')) return <CreditCard className="h-5 w-5" />;
    if (message.includes('Withdrawal')) return <TrendingUp className="h-5 w-5" />;
    if (message.includes('User') || message.includes('Team')) return <UserPlus className="h-5 w-5" />;
    if (message.includes('Request')) return <FileText className="h-5 w-5" />;
    return <Bell className="h-5 w-5" />;
};

// Helper function to get notification title and description
const getNotificationContent = (message: string) => {
    const lines = message.split('\n').filter(line => line.trim());
    const title = lines[0] || 'Notification';
    const description = lines.slice(1, 3).join(' ').replace(/•/g, '').trim() || 'No description available';
    
    return { title, description };
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

// Helper function to group notifications by date
const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
        const date = new Date(notification.created_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        let groupKey: string;
        if (notificationDate.getTime() === today.getTime()) {
            groupKey = 'Today';
        } else if (notificationDate.getTime() === yesterday.getTime()) {
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
        groups[groupKey].push(notification);
    });
    
    return groups;
};

export default function Activity({ notifications = [] }: ActivityProps) {
    const { props } = usePage();
    const groupedNotifications = groupNotificationsByDate(notifications);
    const totalNotifications = notifications.length;

    // Modal states
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isSubmittingCode, setIsSubmittingCode] = useState(false);

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

    const handleMarkAllAsRead = () => {
        // Implement mark all as read functionality
        console.log('Mark all as read clicked');
        toast.success('All notifications marked as read!');
    };

    // Helper function to extract bank account number from notification message
    const extractBankAccountNumber = (message: string): string | null => {
        // Try to find account number patterns in the message
        const patterns = [
            /- Account:\s*([^\n\r]+)/i,           // "- Account: ...577"
            /Account:\s*([^\n\r]+)/i,             // "Account: ...577"
            /- Account Number:\s*([^\n\r]+)/i,    // "- Account Number: ...577"
            /Account Number:\s*([^\n\r]+)/i,      // "Account Number: ...577"
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                // Remove "..." prefix if present and return clean account number
                return match[1].trim().replace(/^\.{3}/, '');
            }
        }

        return null;
    };

    // Helper function to extract bank name from notification message
    const extractBankDetails = (message: string) => {
        // Extract bank name: "- Bank: Cyrus Bennett"
        const bankNameMatch = message.match(/- Bank:\s*([^\n\r]+)/i);
        
        // Extract currency: "- Currency: JPY"
        const currencyMatch = message.match(/- Currency:\s*([^\n\r]+)/i);
        
        // Extract account: "- Account: ...577"
        const accountMatch = extractBankAccountNumber(message);

        return {
            bankName: bankNameMatch ? bankNameMatch[1].trim() : null,
            currency: currencyMatch ? currencyMatch[1].trim() : null,
            accountNumber: accountMatch
        };
    };

    const handleViewNotification = (notification: Notification) => {
        // Extract bank details from notification message
        const bankDetails = extractBankDetails(notification.message);
        
        // Console log notification details and bank account info
        console.log('🔍 NOTIFICATION CLICKED - VIEW DETAILS', '='.repeat(50));
        console.log('📧 Notification Details:', {
            id: notification.id,
            message: notification.message,
            to_user_id: notification.to_user_id,
            created_at: notification.created_at,
            updated_at: notification.updated_at
        });
        
        console.log('🏦 Extracted Bank Details:', bankDetails);
        
        if (bankDetails.accountNumber) {
            console.log('💳 BANK ACCOUNT NUMBER FOUND:', bankDetails.accountNumber);
            console.log('🏪 Bank Name:', bankDetails.bankName || 'Not found in message');
            console.log('💱 Currency:', bankDetails.currency || 'Not found in message');
            console.log('🔢 Clean Account Number (no prefix):', bankDetails.accountNumber);
        } else {
            console.log('⚠️ No bank account number found in notification message');
            console.log('📄 Full message content:', notification.message);
            
            // Show what patterns we're looking for
            console.log('🔍 Expected format examples:');
            console.log('   - Bank: [Bank Name]');
            console.log('   - Account: [Account Number]');
            console.log('   - Currency: [Currency Code]');
        }

        // Log message analysis
        console.log('📝 Message Analysis:', {
            'Is Bank Account Related': notification.message.toLowerCase().includes('bank'),
            'Is Code Verification': isCodeVerificationNotification(notification.message),
            'Contains Bank Details Section': notification.message.includes('Bank Details:'),
            'Message Lines': notification.message.split('\n').length,
            'Message Length': notification.message.length
        });

        console.log('=' .repeat(70));

        setSelectedNotification(notification);
        setIsViewModalOpen(true);
    };

    const handleEnterCode = () => {
        setIsViewModalOpen(false);
        setIsCodeModalOpen(true);
        setVerificationCode('');
    };

    const bankDetails = selectedNotification ? extractBankDetails(selectedNotification.message) : null;


    const handleSubmitCode = () => {
        if (!verificationCode.trim()) {
            toast.error('Please enter a verification code');
            return;
        }

        if (verificationCode.length < 4) {
            toast.error('Verification code must be at least 4 characters');
            return;
        }

        // Console log the verification code being submitted
        console.log('🔐 Verification Code Submitted:', verificationCode);
        console.log('📧 Notification ID:', selectedNotification?.id);
        console.log('👤 User ID:', selectedNotification?.to_user_id);
        console.log('⏰ Submitted at:', new Date().toISOString());

        setIsSubmittingCode(true);

        // Send verification code to backend
        router.post('/verify-2fa-code', {
            code: verificationCode,
            type: 'bank_account_verification',
            notification_id: selectedNotification?.id,
            account_number: bankDetails?.accountNumber,
            bank_name: bankDetails?.bankName,
            currency: bankDetails?.currency
        }, {
            onSuccess: (response) => {
                console.log('✅ 2FA Verification successful:', response);
                setIsSubmittingCode(false);
                setIsCodeModalOpen(false);
                setVerificationCode('');
                // Flash message will be handled by useEffect
            },
            onError: (errors) => {
                console.error('❌ 2FA Verification failed:', errors);
                setIsSubmittingCode(false);
                // Don't close modal on error so user can try again
                // Flash error message will be handled by useEffect
            },
            onFinish: () => {
                console.log('🏁 2FA Verification request completed');
                setIsSubmittingCode(false);
            }
        });
    };

    const handleResendCode = () => {
    // 1. Validation
    if (!bankDetails?.accountNumber || !bankDetails?.bankName) {
        toast.error('Bank account details are required to resend code');
        return;
    }

    // 2. Logging
    console.log('🔄 Resending verification code...');

    // 3. API Call
    router.post('/resend-2fa-code', {
        type: 'bank_account_verification',
        account_number: bankDetails?.accountNumber,
        bank_name: bankDetails?.bankName,
        currency: bankDetails?.currency
    }, {
        // Response handlers
    });
};

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!', { duration: 2000 });
    };

    // Check if notification is about code verification
    const isCodeVerificationNotification = (message: string) => {
        return message.includes('verification code') || 
               message.includes('Code Sent') || 
               message.includes('🔐') ||
               message.toLowerCase().includes('enter the verification code');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity" />
            <Toaster 
                theme="dark" 
                position="top-right" 
                closeButton
                richColors
            />
            <BackButton/>
            <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <Card className="h-full w-full p-6 text-white">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-semibold text-white mb-2">Notifications</h1>
                                <p className="text-gray-400">
                                    You have {totalNotifications} notification{totalNotifications !== 1 ? 's' : ''} to go through
                                </p>
                            </div>
                            <Button 
                                variant="ghost" 
                                onClick={handleMarkAllAsRead}
                                className="text-blue-400 hover:text-blue-300"
                            >
                                Mark all as Read
                            </Button>
                        </div>

                        <CardContent className="p-0">
                            {Object.keys(groupedNotifications).length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-300 mb-2">No notifications yet</h3>
                                    <p className="text-gray-400 text-center">
                                        When you have notifications, they'll appear here.
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
                                    <div key={dateGroup} className="mb-8">
                                        {/* Date Group Header */}
                                        <h2 className="text-sm font-medium text-gray-300 mb-4 px-1">
                                            {dateGroup}
                                        </h2>
                                        
                                        {/* Notifications in this group */}
                                        <div className="space-y-1">
                                            {groupNotifications.map((notification) => {
                                                const { title, description } = getNotificationContent(notification.message);
                                                const icon = getNotificationIcon(notification.message);
                                                const timeAgo = formatTime(notification.created_at);
                                                
                                                return (
                                                    <div 
                                                        key={notification.id}
                                                        className="flex flex-col xs:flex-row xs:items-start gap-2 p-2 sm:p-3 md:p-4 rounded-md md:rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-700/50 group"
                                                    >
                                                        {/* Mobile-First Layout */}
                                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                                            {/* Icon */}
                                                            <div className="flex-shrink-0">
                                                                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-md md:rounded-lg flex items-center justify-center text-blue-400">
                                                                    {icon}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex flex-col gap-1">
                                                                    {/* Title */}
                                                                    <div className="flex flex-col xs:flex-row xs:items-start gap-1 xs:gap-2">
                                                                        <h3 className="font-medium text-white text-xs sm:text-sm md:text-base leading-tight flex-1 min-w-0 break-words group-hover:text-blue-300 transition-colors">
                                                                            {title}
                                                                        </h3>
                                                                    </div>
                                                                    
                                                                    {/* Description */}
                                                                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 leading-relaxed mb-1">
                                                                        {description}
                                                                    </p>
                                                                    
                                                                    {/* Timestamp */}
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-3 w-3 text-gray-500" />
                                                                        <span className="text-xs text-gray-500">
                                                                            {timeAgo}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Action Buttons - Always below on mobile, right side on desktop */}
                                                        <div className="w-full xs:w-auto xs:flex-shrink-0">
                                                            {/* Mobile Buttons - Full Width */}
                                                            <div className="flex gap-1 xs:hidden w-full justify-center">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => handleViewNotification(notification)}
                                                                    className="text-blue-400 border-blue-400 hover:bg-blue-400/10 text-xs py-1.5 px-4"
                                                                >
                                                                    <Eye className="h-3 w-3 mr-1" />
                                                                    View
                                                                </Button>
                                                            </div>
                                                            
                                                            {/* Desktop Buttons - Right Side */}
                                                            <div className="hidden xs:flex md:gap-2 gap-1 flex-shrink-0">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleViewNotification(notification)}
                                                                    className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all"
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
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

            {/* View Notification Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                            <Bell className="h-5 w-5 text-blue-400" />
                            Notification Details
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {selectedNotification && `Received ${formatFullDate(selectedNotification.created_at)}`}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedNotification && (
                        <div className="space-y-6 mt-4">
                            {/* Notification Content */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">
                                    {getNotificationIcon(selectedNotification.message)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-white mb-1">
                                        {getNotificationContent(selectedNotification.message).title}
                                    </h3>
                                    {/* <p className="text-sm text-gray-400">
                                        Notification ID: #{selectedNotification.id}
                                    </p> */}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(selectedNotification.message)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>

                            <Separator className="bg-gray-700" />

                            {/* Full Message */}
                            <div>
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-400" />
                                    Full Message
                                </h3>
                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                    <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                                        {selectedNotification.message}
                                    </pre>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {selectedNotification && isCodeVerificationNotification(selectedNotification.message) && (
                                <>
                                    <Separator className="bg-gray-700" />
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={handleEnterCode}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Key className="h-4 w-4 mr-2" />
                                            Enter Code
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => copyToClipboard(selectedNotification.message)}
                                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Message
                                        </Button>
                                    </div>
                                </>
                            )}

                            {/* <Separator className="bg-gray-700" /> */}

                            {/* Details */}
                            {/* <div>
                                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                    Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Notification ID:</span>
                                            <span className="text-white">#{selectedNotification.id}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Received:</span>
                                            <span className="text-white text-sm">{formatFullDate(selectedNotification.created_at)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-400">Time Ago:</span>
                                            <span className="text-white text-sm">{formatTime(selectedNotification.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Code Verification Modal */}
            <Dialog open={isCodeModalOpen} onOpenChange={setIsCodeModalOpen}>
                <DialogContent className="max-w-md bg-gray-900 text-white border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-400" />
                            Enter Verification Code
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Please enter the verification code sent to your email
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Code Input */}
                        <div className="space-y-2">
                            <Label htmlFor="verification-code" className="text-sm font-medium text-gray-300">
                                Verification Code
                            </Label>
                            <Input
                                id="verification-code"
                                type="text"
                                placeholder="Enter your code here..."
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                maxLength={10}
                                autoFocus
                            />
                            <p className="text-xs text-gray-500">
                                Code should be 4-10 characters long
                            </p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                                <Bell className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-300">
                                    <p className="font-medium mb-1">Need help?</p>
                                    <ul className="text-xs space-y-1 text-blue-200">
                                        <li>• Check your email inbox and spam folder</li>
                                        <li>• Code expires in 24 hours</li>
                                        <li>• Contact support if you didn't receive the code</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                onClick={handleSubmitCode}
                                disabled={isSubmittingCode || !verificationCode.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                            >
                                {isSubmittingCode ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="h-4 w-4 mr-2" />
                                        Verify Code
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsCodeModalOpen(false);
                                    setVerificationCode('');
                                }}
                                disabled={isSubmittingCode}
                                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                                Cancel
                            </Button>
                        </div>

                        {/* Resend Code */}
                        <div className="text-center">
                            <Button
                                variant="ghost"
                                onClick={() => handleResendCode()}
                                disabled={isSubmittingCode}
                                className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
                            >
                                Didn't receive the code? Resend
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}