import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button"
import BackButton from '@/components/back-button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from "@/components/ui/separator";
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'External Accounts',
        href: '/External Accounts',
    },
];

export default function ExternalAccountsPage() {
    const [accountType, setAccountType] = useState("");
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add External Account" />
            <BackButton/>

            <div className="flex h-full flex-col items-center gap-4 rounded-xl p-4">
                <Card className="w-full space-y-6 p-6">
                    <div className="text-center mb-4">
                        <h1 className="text-2xl font-bold">Add External Bank Account</h1>
                        <p className="text-gray-500 text-sm">Enter your bank account details to connect it to your wallet</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="account-type">Account Type</Label>
                        <div className="mt-2">
                            <Select onValueChange={setAccountType}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Account Types</SelectLabel>
                                        <SelectItem value="checking">Checking Account</SelectItem>
                                        <SelectItem value="savings">Savings Account</SelectItem>
                                        <SelectItem value="business">Business Account</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input className="mt-2" type="text" id="bank-name" placeholder="Enter bank name" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="routing-number">Routing Number</Label>
                            <Input className="mt-2" type="text" id="routing-number" placeholder="9 digit routing number" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account-number">Account Number</Label>
                            <Input className="mt-2" type="text" id="account-number" placeholder="Account number" />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h2 className="text-lg font-medium">Account Holder Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first-name">First Name</Label>
                            <Input className="mt-2" type="text" id="first-name" placeholder="First name" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last-name">Last Name</Label>
                            <Input className="mt-2" type="text" id="last-name" placeholder="Last name" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input className="mt-2" type="text" id="address" placeholder="Street address" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input className="mt-2" type="text" id="city" placeholder="City" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input className="mt-2" type="text" id="state" placeholder="State" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input className="mt-2" type="text" id="zip" placeholder="ZIP code" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input className="mt-2" type="tel" id="phone" placeholder="Phone number" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input className="mt-2" type="email" id="email" placeholder="Email address" />
                    </div>

                    <div className="pt-4 text-center">
                        <Button className="w-full md:w-auto px-8 text-white bg-blue-600 hover:bg-blue-700">Add External Account</Button>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}