import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button"
import BackButton from '@/components/back-button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, FormEvent, useRef } from 'react';
import { BreadcrumbItem } from '@/types';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'External Accounts',
        href: '/wallet/external',
    },
];

export default function ExternalAccountsPage() {
    const [currency, setCurrency] = useState("");
    const [country, setCountry] = useState("");
    const [isPrimary, setIsPrimary] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(e.target as HTMLFormElement);
        
        const payload = {
            bank_name: formData.get('bank_name') as string,
            account_name: formData.get('account_name') as string,
            account_number: formData.get('account_number') as string,
            currency,
            swift_code: formData.get('swift_code') as string,
            iban: formData.get('iban') as string,
            bank_address: formData.get('bank_address') as string,
            home_address: formData.get('home_address') as string,
            country,
            is_primary: isPrimary,
        };

        // Basic validation
        if (!payload.bank_name || !payload.account_name || !payload.account_number || !currency || !country) {
            toast.error('Missing Information', {
                description: 'Please fill in all required fields.',
            });
            return;
        }

        // console.log('🚀 External account form submitted:', payload);
        setIsSubmitting(true);

        // Submit to your backend endpoint
        router.post(route('bank-requests.store'), payload, {
            onSuccess: (page) => {
                // console.log('✅ External account request submitted successfully');
                
                // Show success toast immediately
                toast.success('Bank Account Request Submitted! 🎉', {
                    description: `Great! Your ${payload.bank_name} account has been submitted for review. We'll send you an email confirmation once it's approved (usually 1-2 business days).`,
                    duration: 15000,
                    action: {
                        label: 'View Requests',
                        onClick: () => router.visit('/wallet')
                    }
                });
                
                // Reset the form
                if (formRef.current) {
                    formRef.current.reset();
                }
                
                // Reset state variables
                setCurrency('');
                setCountry('');
                setIsPrimary(false);
                
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('❌ Failed to submit external account request:', errors);
                setIsSubmitting(false);
                
                // Handle specific errors
                if (errors.account_number) {
                    toast.error('Invalid Account Number', {
                        description: errors.account_number,
                    });
                } else if (errors.swift_code) {
                    toast.error('Invalid SWIFT Code', {
                        description: errors.swift_code,
                    });
                } else if (errors.currency) {
                    toast.error('Invalid Currency', {
                        description: errors.currency,
                    });
                } else {
                    toast.error('Submission Failed', {
                        description: 'Please check your inputs and try again.',
                    });
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add External Account" />
            <Toaster 
                theme="dark" 
                position="top-right" 
                closeButton
                richColors
            />
            <BackButton/>

            <div className="flex h-full flex-col items-center gap-4 rounded-xl p-4">
                <Card className="w-full max-w-4xl space-y-6 p-6">
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold">Add External Bank Account</h1>
                        <p className="text-gray-500 text-sm">Enter your bank account details to connect it to your wallet</p>
                    </div>

                    <Separator />

                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Account Information */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-medium">Basic Account Information</h2>
                            
                            <div className="space-y-2">
                                <Label htmlFor="account_name">Account Holder Name *</Label>
                                <Input 
                                    className="mt-2" 
                                    type="text" 
                                    id="account_name" 
                                    name="account_name"
                                    placeholder="Full name as it appears on the account" 
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Bank Name *</Label>
                                    <Input 
                                        className="mt-2" 
                                        type="text" 
                                        id="bank_name" 
                                        name="bank_name"
                                        placeholder="Enter bank name" 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_number">Account Number *</Label>
                                    <Input 
                                        className="mt-2" 
                                        type="text" 
                                        id="account_number" 
                                        name="account_number"
                                        placeholder="Account number" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency *</Label>
                                    <Select value={currency} onValueChange={setCurrency} required>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Currencies</SelectLabel>
                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country *</Label>
                                    <Select value={country} onValueChange={setCountry} required>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Countries</SelectLabel>
                                                <SelectItem value="US">United States</SelectItem>
                                                <SelectItem value="CA">Canada</SelectItem>
                                                <SelectItem value="GB">United Kingdom</SelectItem>
                                                <SelectItem value="DE">Germany</SelectItem>
                                                <SelectItem value="FR">France</SelectItem>
                                                <SelectItem value="AU">Australia</SelectItem>
                                                <SelectItem value="JP">Japan</SelectItem>
                                                <SelectItem value="SG">Singapore</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* International Banking Details */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-medium">International Banking Details</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="swift_code">SWIFT/BIC Code</Label>
                                    <Input 
                                        className="mt-2" 
                                        type="text" 
                                        id="swift_code" 
                                        name="swift_code"
                                        placeholder="e.g. CHASUS33" 
                                        maxLength={11}
                                    />
                                    <p className="text-xs text-gray-500">Required for international transfers</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="iban">IBAN</Label>
                                    <Input 
                                        className="mt-2" 
                                        type="text" 
                                        id="iban" 
                                        name="iban"
                                        placeholder="e.g. GB82 WEST 1234 5698 7654 32" 
                                        maxLength={34}
                                    />
                                    <p className="text-xs text-gray-500">International Bank Account Number</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-medium">Address Information</h2>
                            
                            <div className="space-y-2">
                                <Label htmlFor="bank_address">Bank Address</Label>
                                <Input 
                                    className="mt-2" 
                                    type="text" 
                                    id="bank_address" 
                                    name="bank_address"
                                    placeholder="Bank's full address" 
                                />
                                <p className="text-xs text-gray-500">Street address, city, state, country</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="home_address">Your Home Address</Label>
                                <Input 
                                    className="mt-2" 
                                    type="text" 
                                    id="home_address" 
                                    name="home_address"
                                    placeholder="Your home address" 
                                />
                                <p className="text-xs text-gray-500">Street address, city, state, country</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Account Settings */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-medium">Account Settings</h2>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="is_primary" 
                                    checked={isPrimary}
                                    onCheckedChange={setIsPrimary}
                                />
                                <Label htmlFor="is_primary" className="text-sm font-normal">
                                    Set as primary account for withdrawals
                                </Label>
                            </div>
                            <p className="text-xs text-gray-500">Your primary account will be selected by default for withdrawals</p>
                        </div>

                        <div className="pt-4 text-center">
                            <Button 
                                type="submit"
                                className="w-full md:w-auto px-8 text-white bg-blue-600 hover:bg-blue-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding Account...' : 'Add External Account'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}