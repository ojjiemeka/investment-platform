import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowUpRight, FileText, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import DepositPage from './deposit';
import WithdrawalPage from './withdraw';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: '/transactions',
    },
];

// Updated actions array
const actions = [
    { icon: <ArrowUpRight size={20} />, label: 'Send', id: 'send' },
    { icon: <ArrowDown size={20} />, label: 'Deposit', id: 'request' },
    { icon: <FileText size={20} />, label: 'Split bill', id: 'split' },
    { icon: <Plus size={20} />, label: 'Top up', id: 'topup' },
];

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

interface TransactionsProps {
    portfolioBalance: number;
    bankAccounts: BankAccount[];
}

interface FormProps {
    portfolioBalance?: number;
    bankAccounts: BankAccount[];
    onClose: () => void;
}

// Form components for each action with explicit typing and Sonner integration
const SendForm = ({ onClose, portfolioBalance, bankAccounts }: FormProps) => {
    return (
        <div className="space-y-4 p-2 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-medium text-white dark:text-white">Send Money</h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground sm:hidden">
                    <X size={18} />
                </button>
            </div>
            <WithdrawalPage 
                balance={portfolioBalance || 0}
                bankAccounts={bankAccounts} 
            />
        </div>
    );
};

const RequestForm = ({ onClose }: FormProps) => (
    <div className="space-y-4 p-2 sm:p-4">
        <div className="mb-2 flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium text-white dark:text-white">Deposit Cryptocurrency</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground sm:hidden">
                <X size={18} />
            </button>
        </div>
        <DepositPage />
    </div>
);

const SplitBillForm = ({ onClose }: FormProps) => {
    const [formData, setFormData] = useState({
        description: '',
        totalAmount: '',
        people: '',
        splitType: 'equal'
    });
    const [loading, setLoading] = useState(false);

    const handleSplitBill = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('🔄 Split bill form submitted', formData); // Debug log
        
        // Basic validation
        if (!formData.description || !formData.totalAmount || !formData.people) {
            console.log('❌ Validation failed - missing fields'); // Debug log
            toast.error("Missing Information", {
                description: "Please fill in all required fields",
                duration: 4000,
            });
            return;
        }

        const amount = parseFloat(formData.totalAmount);
        if (amount <= 0 || isNaN(amount)) {
            console.log('❌ Validation failed - invalid amount:', amount); // Debug log
            toast.error("Invalid Amount", {
                description: "Please enter a valid amount greater than 0",
                duration: 4000,
            });
            return;
        }

        setLoading(true);
        console.log('⏳ Processing split bill...'); // Debug log

        try {
            // Simulate API call - replace with your actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log('✅ Split bill successful'); // Debug log
            
            // Success toast with detailed information
            toast.success("Bill Split Successfully! 🎉", {
                description: `${formData.description} for $${amount.toFixed(2)} has been split. Requests sent to all participants.`,
                duration: 6000,
                action: {
                    label: "View Details",
                    onClick: () => {
                        console.log('📋 View details clicked');
                        router.visit('/transactions');
                    }
                }
            });
            
            // Reset form and close
            setFormData({
                description: '',
                totalAmount: '',
                people: '',
                splitType: 'equal'
            });
            
            // Close form after a short delay to allow user to see the toast
            setTimeout(() => {
                onClose();
            }, 1000);
            
        } catch (error) {
            console.log('❌ Split bill failed:', error); // Debug log
            toast.error("Split Failed", {
                description: "Failed to split bill. Please try again.",
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-2 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-medium text-white dark:text-white">Split Bill</h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground sm:hidden">
                    <X size={18} />
                </button>
            </div>
            <form onSubmit={handleSplitBill} className="space-y-3">
                <div>
                    <Label htmlFor="description" className="text-foreground text-white dark:text-white">
                        Bill Description
                    </Label>
                    <Input 
                        id="description" 
                        placeholder="Dinner, Rent, etc." 
                        className="text-foreground border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-400"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="totalAmount" className="text-foreground text-white dark:text-white">
                        Total Amount
                    </Label>
                    <Input 
                        id="totalAmount" 
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00" 
                        className="text-foreground border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-400"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="people" className="text-foreground text-white dark:text-white">
                        People to Split With
                    </Label>
                    <Input 
                        id="people" 
                        placeholder="john@example.com, jane@example.com" 
                        className="text-foreground border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-400"
                        value={formData.people}
                        onChange={(e) => setFormData(prev => ({ ...prev, people: e.target.value }))}
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1">Separate multiple emails with commas</p>
                </div>
                <div>
                    <Label htmlFor="splitType" className="text-foreground text-white dark:text-white">
                        Split Type
                    </Label>
                    <Select 
                        value={formData.splitType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, splitType: value }))}
                    >
                        <SelectTrigger className="text-foreground border-zinc-700 bg-zinc-800 text-white">
                            <SelectValue placeholder="How to split" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-700 bg-zinc-800">
                            <SelectItem value="equal" className="text-foreground text-white">Equal Split</SelectItem>
                            <SelectItem value="percentage" className="text-foreground text-white">By Percentage</SelectItem>
                            <SelectItem value="custom" className="text-foreground text-white">Custom Amounts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Test Toast Button for Debugging */}
                {/* <div className="flex gap-2">
                    <Button 
                        type="button"
                        onClick={() => {
                            console.log('🧪 Test toast triggered');
                            toast.success("Test Toast", {
                                description: "This is a test to check if toasts are working",
                                duration: 3000,
                            });
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1"
                    >
                        Test Toast
                    </Button>
                </div> */}
                
                <Button 
                    type="submit" 
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Split Bill"}
                </Button>
            </form>
        </div>
    );
};

const TopUpForm = ({ onClose }: FormProps) => {
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'card',
        cardDetails: ''
    });
    const [loading, setLoading] = useState(false);

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('🔄 Top up form submitted', formData); // Debug log
        
        if (!formData.amount || !formData.cardDetails) {
            console.log('❌ Validation failed - missing fields'); // Debug log
            toast.error("Missing Information", {
                description: "Please fill in all required fields",
                duration: 4000,
            });
            return;
        }

        const amount = parseFloat(formData.amount);
        if (amount <= 0 || isNaN(amount)) {
            console.log('❌ Validation failed - invalid amount:', amount); // Debug log
            toast.error("Invalid Amount", {
                description: "Please enter a valid amount greater than 0",
                duration: 4000,
            });
            return;
        }

        setLoading(true);
        console.log('⏳ Processing top up...'); // Debug log
        
        try {
            // Simulate API call - replace with your actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('✅ Top up successful'); // Debug log
            
            toast.success(`Top Up Successful! 🎉`, {
                description: `$${amount.toFixed(2)} has been added to your account via ${formData.paymentMethod}. Your new balance will be updated shortly.`,
                duration: 6000,
                action: {
                    label: "View Balance",
                    onClick: () => {
                        console.log('💰 View balance clicked');
                        router.visit('/wallet');
                    }
                }
            });
            
            // Reset form and close
            setFormData({
                amount: '',
                paymentMethod: 'card',
                cardDetails: ''
            });
            
            // Close form after a short delay to allow user to see the toast
            setTimeout(() => {
                onClose();
            }, 1000);
            
            // Optionally refresh the page to show updated balance
            setTimeout(() => {
                router.reload({ only: ['portfolioBalance'] });
            }, 2000);
            
        } catch (error) {
            console.log('❌ Top up failed:', error); // Debug log
            toast.error("Top Up Failed", {
                description: "Failed to process payment. Please try again.",
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-2 sm:p-4">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-foreground text-lg font-medium text-white">Top Up Account</h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground sm:hidden">
                    <X size={18} />
                </button>
            </div>
            <form onSubmit={handleTopUp} className="space-y-3">
                <div>
                    <Label htmlFor="amount" className="text-foreground text-white">Amount</Label>
                    <Input 
                        id="amount" 
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00" 
                        className="text-foreground border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-400"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="paymentMethod" className="text-foreground text-white">Payment Method</Label>
                    <Select 
                        value={formData.paymentMethod}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                    >
                        <SelectTrigger className="text-foreground border-zinc-700 bg-zinc-800 text-white">
                            <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-700 bg-zinc-800">
                            <SelectItem value="card" className="text-foreground text-white">Credit/Debit Card</SelectItem>
                            <SelectItem value="bank" className="text-foreground text-white">Bank Transfer</SelectItem>
                            <SelectItem value="paypal" className="text-foreground text-white">PayPal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="card" className="text-foreground text-white">
                        {formData.paymentMethod === 'card' ? 'Card Details' : 
                         formData.paymentMethod === 'bank' ? 'Account Number' : 'PayPal Email'}
                    </Label>
                    <Input 
                        id="card" 
                        placeholder={
                            formData.paymentMethod === 'card' ? 'XXXX XXXX XXXX XXXX' : 
                            formData.paymentMethod === 'bank' ? 'Account number' : 'your@email.com'
                        }
                        className="text-foreground border-zinc-700 bg-zinc-800 text-white placeholder:text-gray-400"
                        value={formData.cardDetails}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardDetails: e.target.value }))}
                        required
                    />
                </div>
                
                {/* Test Toast Button for Debugging */}
                {/* <div className="flex gap-2">
                    <Button 
                        type="button"
                        onClick={() => {
                            console.log('🧪 Test toast triggered');
                            toast.success("Test Toast", {
                                description: "This is a test to check if toasts are working",
                                duration: 3000,
                            });
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1"
                    >
                        Test Toast
                    </Button>
                </div> */}
                
                <Button 
                    type="submit" 
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Add Funds"}
                </Button>
            </form>
        </div>
    );
};

export default function Transactions({ portfolioBalance, bankAccounts }: TransactionsProps) {
    const [activeForm, setActiveForm] = useState<string | null>(null);

    // Add useEffect for debugging
    // useEffect(() => {
    //     console.log('🎯 Transactions component mounted');
    //     // Test toast on component mount
    //     setTimeout(() => {
    //         toast.success("Component Loaded", {
    //             description: "Transactions component is ready",
    //             duration: 2000,
    //         });
    //     }, 500);
    // }, []);

    const handleActionClick = (actionId: string, e: React.MouseEvent) => {
        e.preventDefault();
        console.log('🎬 Action clicked:', actionId);
        setActiveForm(actionId === activeForm ? null : actionId);
    };

    const renderForm = () => {
        switch (activeForm) {
            case 'send':
                return <SendForm 
                    onClose={() => setActiveForm(null)} 
                    portfolioBalance={portfolioBalance} 
                    bankAccounts={bankAccounts}
                />;
            case 'request':
                return <RequestForm 
                    onClose={() => setActiveForm(null)} 
                    portfolioBalance={portfolioBalance}
                    bankAccounts={bankAccounts}
                />;
            case 'split':
                return <SplitBillForm 
                    onClose={() => setActiveForm(null)}
                    portfolioBalance={portfolioBalance}
                    bankAccounts={bankAccounts}
                />;
            case 'topup':
                return <TopUpForm 
                    onClose={() => setActiveForm(null)}
                    portfolioBalance={portfolioBalance}
                    bankAccounts={bankAccounts}
                />;
            default:
                return null;
        }
    };

    return (
        <>
            {/* Move Toaster outside AppLayout to ensure it's always rendered */}
            <Toaster 
                theme="dark" 
                position="top-right" 
                closeButton
                richColors
                expand={true}
                visibleToasts={5}
                duration={4000}
                style={{
                    zIndex: 9999,
                }}
                toastOptions={{
                    style: {
                        background: '#1f2937',
                        border: '1px solid #374151',
                        color: '#f9fafb',
                    },
                    className: 'my-toast',
                    descriptionClassName: 'my-toast-description',
                }}
            />
            
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Send & Request" />
                
                <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[70vh] flex-1 overflow-hidden rounded-xl md:min-h-min">
                        <div className="grid auto-rows-min gap-4">
                            {/* Main Card Container */}
                            <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border bg-zinc-900 dark:bg-zinc-800">
                                <div className="flex h-full flex-col sm:flex-row">
                                    {/* Action Buttons Column - Takes full width on mobile, 1/3 on larger screens */}
                                    <div className="flex w-full flex-row border-b border-zinc-800 sm:w-1/3 sm:flex-col sm:border-r sm:border-b-0 dark:border-zinc-700">
                                        <div className="flex w-full flex-row sm:h-full sm:flex-col">
                                            {actions.map((action, index) => (
                                                <button
                                                    key={index}
                                                    onClick={(e) => handleActionClick(action.id, e)}
                                                    className={`flex flex-1 flex-col items-center justify-center py-4 transition-all duration-200 hover:bg-zinc-800 sm:flex-auto sm:py-8 dark:hover:bg-zinc-700 ${
                                                        activeForm === action.id ? 'bg-zinc-800 dark:bg-zinc-700' : ''
                                                    }`}
                                                >
                                                    <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-black p-2 text-white sm:mb-2 sm:h-12 sm:w-12 dark:bg-white dark:text-black">
                                                        {action.icon}
                                                    </div>
                                                    <span className="text-muted-foreground hover:text-foreground text-center text-xs font-medium sm:text-sm">
                                                        {action.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Form Area - Takes remaining width */}
                                    <div className="flex-1 p-2 sm:p-4">
                                        {activeForm ? (
                                            renderForm()
                                        ) : (
                                            <div className="text-muted-foreground flex h-full items-center justify-center">
                                            <p>Select an action to continue</p>
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}