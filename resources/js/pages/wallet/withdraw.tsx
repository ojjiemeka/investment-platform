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
}

export default function WithdrawalPage({ balance, bankAccounts }: WithdrawalPageProps) {
    const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
    const [currency, setCurrency] = useState<string>('usd');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { props } = usePage();

    // Track if we just submitted a form - ONLY process notifications after submission
    const justSubmitted = useRef(false);
    const processedNotificationIds = useRef<Set<number>>(new Set());

    // ONLY handle notifications when we've just submitted a form
    useEffect(() => {
        // Don't check notifications unless we just submitted
        if (!justSubmitted.current) return;

        const user = (props as any).auth?.user;
        const notifications: Notification[] = user?.notifications || [];

        // console.log('🔍 Post-submission notification check:', notifications);

        if (notifications.length > 0) {
            // Sort notifications by creation date to get the most recent one
            const sortedNotifications = notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            // Get the most recent notification (first after sorting)
            const latestNotification = sortedNotifications[0];

            // console.log('📧 All notifications sorted by date:', sortedNotifications);
            // console.log('📧 Latest notification after submission:', latestNotification);

            // Only show toast if this notification hasn't been processed yet
            if (!processedNotificationIds.current.has(latestNotification.id)) {
                // Check if this is a withdrawal notification
                if (latestNotification.message.includes('Withdrawal Request Submitted')) {
                    // console.log('🎉 Showing withdrawal success toast after submission');

                    // Parse and format the notification message for better UI display
                    const formatNotificationMessage = (message: string) => {
                        // Split the message by bullet points
                        const parts = message.split('•').map((part) => part.trim());

                        // Extract the main parts
                        const title = parts[0]; // "Withdrawal Request Submitted"
                        const amount = parts[1]?.replace('Amount: ', '') || '';
                        const destination = parts[2]?.replace('Destination: ', '') || '';
                        const status = parts[3]?.replace('Status: ', '') || '';

                        // Format as a nice description
                        return `${amount} will be sent to ${destination}. ${status}.`;
                    };

                    const formattedDescription = formatNotificationMessage(latestNotification.message);

                    toast.success('Withdrawal Initiated', {
                        description: formattedDescription,
                        duration: 12000,
                        action: {
                            label: 'View Transactions',
                            onClick: () => router.visit('/transactions'),
                        },
                    });

                    // Mark this notification as processed
                    processedNotificationIds.current.add(latestNotification.id);

                    // Clear form after showing success
                    setTimeout(() => {
                        const amountInput = document.getElementById('amount') as HTMLInputElement;
                        const noteInput = document.getElementById('note') as HTMLInputElement;
                        if (amountInput) amountInput.value = '';
                        if (noteInput) noteInput.value = '';
                    }, 100);
                }
            }
        }

        // Reset the submission flag
        justSubmitted.current = false;
    }, [props]); // Still watch props for changes

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
            });
            return;
        }

        // Validate amount is positive
        const amount = parseFloat(amountInput?.value);
        if (amount <= 0) {
            toast.error('Invalid Amount', {
                description: 'Please enter a valid amount greater than 0.',
            });
            return;
        }

        // Validate sufficient balance
        if (amount > balance) {
            toast.error('Insufficient Balance', {
                description: 'The withdrawal amount exceeds your available balance.',
            });
            return;
        }

        // console.log('🚀 Form submitted with payload:', payload);

        setIsSubmitting(true);
        // Mark that we're submitting - this will trigger notification checking
        justSubmitted.current = true;

        router.post(route('transaction-records.store'), payload, {
            onSuccess: (page) => {
                // console.log('✅ Form submission successful');
                setIsSubmitting(false);

                // The notification will be handled by useEffect since justSubmitted.current = true
            },
            onError: (errors) => {
                console.error('❌ Form submission failed:', errors);
                setIsSubmitting(false);

                // Reset the submission flag since we got an error
                justSubmitted.current = false;

                // Handle form validation errors immediately
                if (errors.amount) {
                    toast.error('Invalid Amount', {
                        description: errors.amount,
                    });
                } else if (errors.selectedAccountId) {
                    toast.error('Account Selection Error', {
                        description: errors.selectedAccountId,
                    });
                } else {
                    toast.error('Submission Failed', {
                        description: 'Please check your inputs and try again.',
                    });
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
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
                            // console.log('🔄 User selected account ID:', value);
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a bank account" />
                        </SelectTrigger>
                        <SelectContent>
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
                        className="border-zinc-700 bg-zinc-800"
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
                    <Input id="note" placeholder="Add a note" className="border-zinc-700 bg-zinc-800" />
                </div>

                <div>
                    <Link className="text-[13px] text-red-700 hover:text-red-800 hover:underline" href="/wallet/external">
                        add external account
                    </Link>
                </div>

                <Button type="submit" variant="default" className="w-full bg-blue-800 hover:bg-zinc-700 dark:text-white" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Send Payment'}
                </Button>
            </div>
        </form>
    );
}
