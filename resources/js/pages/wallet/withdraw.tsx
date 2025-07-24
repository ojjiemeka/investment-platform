import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BreadcrumbItem } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

interface Notification {
    id: number;
    message: string;
    to_user_id: number;
    created_at: string;
    updated_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Withdrawal', href: '/withdrawal' }];

const formatCurrency = (value: number, currencyCode: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode.toUpperCase(),
        maximumFractionDigits: 2,
    }).format(value);
};

interface WithdrawalPageProps {
    balance: number;
    bankAccounts: BankAccount[];
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export default function WithdrawalPage({ balance, bankAccounts, onSuccess, onError }: WithdrawalPageProps) {
    const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
    const [currency, setCurrency] = useState<string>('usd');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { props } = usePage();

    // Track if we just submitted a form - ONLY process notifications after submission
    const justSubmitted = useRef(false);
    const processedNotificationIds = useRef<Set<number>>(new Set());
    const lastSubmissionData = useRef<any>(null);

    // Enhanced notification handling with multiple fallback methods
    useEffect(() => {
        console.log('🔍 UseEffect triggered, justSubmitted:', justSubmitted.current);
        console.log('📊 Current props:', props);
        
        // Don't check notifications unless we just submitted
        if (!justSubmitted.current) return;

        // Method 1: Check for flash messages (most reliable)
        const flash = (props as any).flash;
        if (flash?.message) {
            console.log('📨 Flash message found:', flash);
            
            if (flash.type === 'success') {
                console.log('✅ Showing flash success toast');
                toast.success('Withdrawal Initiated! 🎉', {
                    description: flash.message,
                    duration: 8000,
                    action: {
                        label: 'View Activity',
                        onClick: () => router.visit('/wallet/activity'),
                    },
                });
                
                // Call parent success callback if provided
                if (onSuccess) {
                    onSuccess(flash.message);
                }
                
                // Clear form
                clearForm();
                justSubmitted.current = false;
                return;
            } else if (flash.type === 'error') {
                console.log('❌ Showing flash error toast');
                toast.error('Withdrawal Failed', {
                    description: flash.message,
                    duration: 6000,
                });
                
                // Call parent error callback if provided
                if (onError) {
                    onError(flash.message);
                }
                
                justSubmitted.current = false;
                return;
            }
        }

        // Method 2: Check user notifications (fallback)
        const user = (props as any).auth?.user;
        const notifications: Notification[] = user?.notifications || [];

        console.log('👤 User notifications check:', notifications.length, 'notifications found');

        if (notifications.length > 0) {
            // Sort notifications by creation date to get the most recent one
            const sortedNotifications = notifications.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Get the most recent notification (first after sorting)
            const latestNotification = sortedNotifications[0];

            console.log('📧 Latest notification:', latestNotification);

            // Only show toast if this notification hasn't been processed yet
            if (!processedNotificationIds.current.has(latestNotification.id)) {
                // Check if this is a withdrawal notification
                if (latestNotification.message.includes('Withdrawal Request Submitted') || 
                    latestNotification.message.includes('withdrawal') || 
                    latestNotification.message.includes('sent')) {
                    
                    console.log('🎉 Showing withdrawal success toast from notifications');

                    // Parse and format the notification message for better UI display
                    const formatNotificationMessage = (message: string) => {
                        // Split the message by bullet points
                        const parts = message.split('•').map((part) => part.trim());

                        // Extract the main parts
                        const title = parts[0] || 'Withdrawal Request Submitted';
                        const amount = parts[1]?.replace('Amount: ', '') || '';
                        const destination = parts[2]?.replace('Destination: ', '') || '';
                        const status = parts[3]?.replace('Status: ', '') || 'Processing';

                        // Format as a nice description
                        if (amount && destination) {
                            return `${amount} will be sent to ${destination}. ${status}.`;
                        } else {
                            // Fallback to showing first part of message
                            return message.split('\n')[0] || 'Your withdrawal request has been submitted successfully.';
                        }
                    };

                    const formattedDescription = formatNotificationMessage(latestNotification.message);

                    toast.success('Withdrawal Initiated! 🎉', {
                        description: formattedDescription,
                        duration: 8000,
                        action: {
                            label: 'View Activity',
                            onClick: () => router.visit('/wallet/activity'),
                        },
                    });

                    // Call parent success callback if provided
                    if (onSuccess) {
                        onSuccess(formattedDescription);
                    }

                    // Mark this notification as processed
                    processedNotificationIds.current.add(latestNotification.id);

                    // Clear form after showing success
                    clearForm();
                }
            }
        }

        // Method 3: Fallback based on last submission data (if no notifications found)
        if (notifications.length === 0 && lastSubmissionData.current) {
            console.log('🔄 No notifications found, using fallback success toast');
            const { amount, selectedAccount } = lastSubmissionData.current;
            
            toast.success('Withdrawal Initiated! 🎉', {
                description: `Your withdrawal of ${formatCurrency(parseFloat(amount))} to ${selectedAccount?.bank_name} ending in ${selectedAccount?.account_number?.slice(-4)} has been submitted for processing.`,
                duration: 8000,
                action: {
                    label: 'View Activity',
                    onClick: () => router.visit('/wallet/activity'),
                },
            });
            
            // Call parent success callback if provided
            if (onSuccess) {
                onSuccess(`Withdrawal of ${formatCurrency(parseFloat(amount))} submitted successfully`);
            }
            
            clearForm();
        }

        // Reset the submission flag
        justSubmitted.current = false;
        lastSubmissionData.current = null;
    }, [props, onSuccess, onError]);

    const clearForm = () => {
        setTimeout(() => {
            const amountInput = document.getElementById('amount') as HTMLInputElement;
            const noteInput = document.getElementById('note') as HTMLInputElement;
            if (amountInput) amountInput.value = '';
            if (noteInput) noteInput.value = '';
        }, 100);
    };

    useEffect(() => {
        if (bankAccounts.length > 0) {
            const primaryAccount = bankAccounts.find((acc) => acc.is_primary);
            if (primaryAccount) {
                setSelectedAccountId(String(primaryAccount.id));
            }
        }
    }, [bankAccounts]);

    const { post } = useForm();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const amountInput = document.getElementById('amount') as HTMLInputElement;
        const noteInput = document.getElementById('note') as HTMLInputElement;

        const payload = {
            selectedAccountId,
            amount: amountInput?.value,
            note: noteInput?.value,
            currency,
        };

        if (!selectedAccountId || !amountInput?.value) {
            toast.error('Error', {
                description: 'Please select a bank account and enter an amount.',
                duration: 4000,
            });
            return;
        }

        // Validate amount is positive
        const amount = parseFloat(amountInput?.value);
        if (amount <= 0 || isNaN(amount)) {
            toast.error('Invalid Amount', {
                description: 'Please enter a valid amount greater than 0.',
                duration: 4000,
            });
            return;
        }

        // Validate sufficient balance
        if (amount > balance) {
            toast.error('Insufficient Balance', {
                description: 'The withdrawal amount exceeds your available balance.',
                duration: 4000,
            });
            return;
        }

        // Store submission data for fallback
        const selectedAccount = bankAccounts.find(acc => acc.id === parseInt(selectedAccountId));
        lastSubmissionData.current = {
            amount: amountInput?.value,
            selectedAccount: selectedAccount,
            note: noteInput?.value,
            currency: currency
        };

        console.log('🚀 Form submitted with payload:', payload);
        console.log('💾 Stored submission data:', lastSubmissionData.current);

        setIsSubmitting(true);
        // Mark that we're submitting - this will trigger notification checking
        justSubmitted.current = true;

        // Show immediate processing toast
        toast.loading('Processing withdrawal...', {
            id: 'withdrawal-processing',
            duration: 3000,
        });

        router.post(route('transaction-records.store'), payload, {
            onSuccess: (page) => {
                console.log('✅ Form submission successful, page response:', page);
                setIsSubmitting(false);
                
                // Dismiss the loading toast
                toast.dismiss('withdrawal-processing');

                // The success notification will be handled by useEffect since justSubmitted.current = true
                // But add a fallback timeout in case notifications don't work
                setTimeout(() => {
                    if (justSubmitted.current) {
                        console.log('⏰ Timeout triggered - showing fallback success toast');
                        toast.success('Withdrawal Submitted! 🎉', {
                            description: `Your withdrawal of ${formatCurrency(amount)} has been submitted for processing.`,
                            duration: 6000,
                            action: {
                                label: 'View Activity',
                                onClick: () => router.visit('/wallet/activity'),
                            },
                        });
                        
                        if (onSuccess) {
                            onSuccess(`Withdrawal of ${formatCurrency(amount)} submitted successfully`);
                        }
                        
                        clearForm();
                        justSubmitted.current = false;
                    }
                }, 2000);
            },
            onError: (errors) => {
                console.error('❌ Form submission failed:', errors);
                setIsSubmitting(false);
                
                // Dismiss the loading toast
                toast.dismiss('withdrawal-processing');

                // Reset the submission flag since we got an error
                justSubmitted.current = false;
                lastSubmissionData.current = null;

                // Handle form validation errors immediately
                let errorMessage = 'Please check your inputs and try again.';
                
                if (errors.amount) {
                    errorMessage = errors.amount;
                } else if (errors.selectedAccountId) {
                    errorMessage = errors.selectedAccountId;
                } else if (typeof errors === 'string') {
                    errorMessage = errors;
                } else if (errors.message) {
                    errorMessage = errors.message;
                }

                toast.error('Submission Failed', {
                    description: errorMessage,
                    duration: 5000,
                });
                
                // Call parent error callback if provided
                if (onError) {
                    onError(errorMessage);
                }
            },
            onFinish: () => {
                console.log('🏁 Form submission finished');
                setIsSubmitting(false);
                // Dismiss the loading toast
                toast.dismiss('withdrawal-processing');
            },
        });
    };

    return (
        <div className="space-y-4">
            {/* Debug Section - Remove in production */}
            {/* <div className="bg-gray-800 p-3 rounded text-xs">
                <p>Debug Info:</p>
                <p>• justSubmitted: {justSubmitted.current.toString()}</p>
                <p>• isSubmitting: {isSubmitting.toString()}</p>
                <p>• bankAccounts: {bankAccounts.length}</p>
                <Button 
                    type="button"
                    onClick={() => {
                        console.log('🧪 Test toast in WithdrawalPage');
                        toast.success("Test Toast", {
                            description: "WithdrawalPage toast system is working",
                            duration: 3000,
                        });
                    }}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                >
                    Test Toast
                </Button>
            </div> */}

            <form onSubmit={handleSubmit} className="space-y-3 text-white dark:text-white">
                <div className="space-y-3 text-white dark:text-white">
                    <div className="mt-8 mb-8 flex justify-between">
                        <h1 className="text-2xl font-bold">Balance:</h1>
                        <h1 className="text-2xl font-bold">{formatCurrency(balance)}</h1>
                    </div>

                    <Label htmlFor="bank-account">Select an account</Label>
                    <div className="mt-2">
                        <Select
                            value={selectedAccountId}
                            onValueChange={(value) => {
                                setSelectedAccountId(value);
                                console.log('🔄 User selected account ID:', value);
                            }}
                        >
                            <SelectTrigger className="w-full bg-zinc-800 border-zinc-700">
                                <SelectValue placeholder="Select a bank account" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectGroup>
                                    <SelectLabel>Bank Accounts</SelectLabel>
                                    {bankAccounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            <div className="flex w-full items-center justify-between">
                                                <span>
                                                    {acc.bank_name} • …{acc.account_number.slice(-4)}
                                                </span>
                                                {acc.is_primary && (
                                                    <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">Primary</span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={balance}
                            placeholder="0.00"
                            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="border-zinc-700 bg-zinc-800">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-700 bg-zinc-800">
                                <SelectItem value="usd">USD</SelectItem>
                                <SelectItem value="eur">EUR</SelectItem>
                                <SelectItem value="gbp">GBP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="note">Note (optional)</Label>
                        <Input 
                            id="note" 
                            placeholder="Add a note" 
                            className="border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-400" 
                        />
                    </div>

                    <div>
                        <Link className="text-[13px] text-red-700 hover:text-red-800 hover:underline" href="/wallet/external">
                            add external account
                        </Link>
                    </div>

                    <Button 
                        type="submit" 
                        variant="default" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Send Payment'}
                    </Button>
                </div>
            </form>
        </div>
    );
}