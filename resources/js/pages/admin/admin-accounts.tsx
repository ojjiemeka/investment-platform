import CustomTable from '@/components/admin-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react'; // Import useForm
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Plus, Users as UsersIcon, CreditCard, AlertCircle, Building } from 'lucide-react';
import { useState } from 'react';
import DashboardStats from '@/components/dashboardStats'; // Import the DashboardStats component

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Accounts',
        href: '/wallet/admin/accounts',
    },
];

interface BankAccount {
    user_id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    swift_code: string;
    iban: string;
    home_address: string;
    country: string;
    bank_address: string;
    status: string;
    is_primary: boolean;
    // ... any other bank account fields
}

interface User {
    id: string; // Assuming ID can be string or number based on your DB
    name: string;
    email: string;
    created_at: string; // Assuming created_at is a string date from backend
    status?: string; // User's overall status (e.g., Active, Inactive)
    bank_accounts?: BankAccount[]; // Array of bank accounts
    home_address?: string | null; // Home address for the user
    country?: string | null;     // Country for the user
    user_type?: string; // Add this new field for the select dropdown
    // Add other user properties like avatar, jobTitle, department if needed
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface PaginatedUsers {
    data: User[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: PaginationMeta;
}

interface AdminAccountsProps {
    users: PaginatedUsers;
    totalUsersCount: number;
    totalBankAccountsCount: number;
    pendingRequestsCount: number;
    totalPortfoliosCount?: number;
    inactiveAccountsCount?: number;
}

// Define interface for the new bank account form data
interface NewBankAccountFormData {
    user_id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    currency: string;
    swift_code: string;
    iban: string;
    country: string;
    home_address: string;
    bank_address: string;
    is_primary: boolean;
}

export default function AdminAccounts({
    users,
    totalUsersCount = 0,
    totalBankAccountsCount = 0,
    pendingRequestsCount = 0,
    totalPortfoliosCount,
    inactiveAccountsCount = 0
}: AdminAccountsProps) {

    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [viewedUser, setViewedUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openAddAccount, setOpenAddAccount] = useState(false);

    // Inertia.js useForm for editing user details
    const { data: editedUser, setData: setEditedUser, patch, processing: isEditingUser, errors: editErrors } = useForm<Partial<User>>({
        id: '',
        name: '',
        email: '',
        home_address: '',
        country: '',
        user_type: '', // Add this new field
    });

    // Inertia.js useForm for adding a new bank account
    const { data: newAccountData, setData: setNewAccountData, post, processing: isAddingAccount, errors: addAccountErrors, reset: resetNewAccountForm } = useForm<NewBankAccountFormData>({
        user_id: '',
        bank_name: '',
        account_name: '',
        account_number: '',
        currency: '',
        swift_code: '',
        iban: '',
        country: '',
        home_address: '',
        bank_address: '',
        is_primary: false,
    });

    const dashboardStats = [
        {
            title: 'Total Users',
            value: totalUsersCount.toLocaleString(),
            change: '+47',
            icon: UsersIcon,
            positive: true,
        },
        {
            title: 'Active Bank Accounts',
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
        ...(totalPortfoliosCount !== undefined ? [{
            title: 'Total Portfolios',
            value: totalPortfoliosCount.toLocaleString(),
            change: '+15',
            icon: Building,
            positive: true,
        }] : []),
    ];

    const toggleUser = (id: string) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const handleView = (user: User) => {
        setViewedUser(user);
        // Initialize the editedUser form with the current viewed user's data
        setEditedUser({
            id: user.id,
            name: user.name,
            email: user.email,
            home_address: user.home_address,
            country: user.country,
            user_type: user.user_type, // Add this line
        });
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    // This handler will now directly update the `editedUser` data from useForm
    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>, field: keyof User) => {
        setEditedUser(field, event.target.value);
    };

    // Add this helper function to handle select changes
    const handleSelectChange = (field: keyof User, value: string) => {
        setEditedUser(field, value);
    };

    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission

        if (editedUser && editedUser.id) {
            // Use Inertia's patch method for updating an existing resource
            patch(route('users.update', editedUser.id), {
                onSuccess: () => {
                    alert('User updated successfully!');
                    setIsEditing(false); // Close edit mode on success
                    // Update the viewed user with the edited data
                    if (viewedUser) {
                        setViewedUser({
                            ...viewedUser,
                            ...editedUser
                        });
                    }
                },
                onError: (errors) => {
                    console.error('Error updating user:', errors);
                    alert('Failed to update user. Check console for details.');
                }
            });
        }
    };

    const handleAddAccountSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission

        // Use Inertia's post method for creating a new resource
        post(route('bank-accounts.store'), {
            onSuccess: () => {
                alert('Bank account added successfully!');
                setOpenAddAccount(false); // Close dialog on success
                resetNewAccountForm(); // Clear the form
                // Optionally refresh the user list or specific user's bank accounts
            },
            onError: (errors) => {
                console.error('Error adding bank account:', errors);
                alert('Failed to add bank account. Check console for details.');
            }
        });
    };

    const tableHeaders = [
        <div key="col-id" className="w-10">#</div>,
        <div key="col-user-info" className="flex items-center space-x-1">
            <span>User Info</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-bank-name" className="flex items-center space-x-1">
            <span>Bank Name</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-account-number" className="flex items-center space-x-1">
            <span>Account Number</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-bank-address" className="flex items-center space-x-1">
            <span>Bank Address</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-home-address" className="flex items-center space-x-1">
            <span>Home Address</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-country" className="flex items-center space-x-1">
            <span>Country</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-actions">Actions</div>,
    ];

    const tableData = users.data?.map(user => {
        const primaryBankAccount = user.bank_accounts?.find(account => account.is_primary);
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            bankAccount: primaryBankAccount ? `${primaryBankAccount.bank_name} (${primaryBankAccount.account_number})` : 'N/A',
            status: user.status || 'N/A',
            originalItem: user, // Pass the full user object for view/edit
        };
    }) || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Account Management" />
            <div className="flex h-full flex-col gap-6 p-4 md:p-6">
                <DashboardStats stats={dashboardStats} />

                <AnimatePresence mode="wait">
                    {viewedUser ? (
                        <motion.div
                            key={isEditing ? 'editPage' : 'viewPage'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            <Card className="bg-white shadow-sm dark:bg-zinc-800 p-4">
                                <div className="p-2 flex justify-between items-center">
                                    <h1>{isEditing ? "Edit User Details" : "User Details"}</h1>
                                    <Button onClick={() => {
                                        setIsEditing(false);
                                        setViewedUser(null);
                                    }}>
                                        {isEditing ? "Cancel" : "Close"}
                                    </Button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {isEditing && editedUser ? (
                                        // Wrap your edit form in a <form> tag
                                        <form onSubmit={handleUserSubmit}>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label htmlFor="name" className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300">Name</label>
                                                <Input id="name" value={editedUser.name || ''} onChange={(e) => handleEditChange(e, 'name')} className="col-span-3" />
                                                {editErrors.name && <div className="col-span-4 text-red-500 text-sm">{editErrors.name}</div>}
                                            </div>
                                            
                                            <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                                <label htmlFor="email" className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300">Email</label>
                                                <Input id="email" value={editedUser.email || ''} onChange={(e) => handleEditChange(e, 'email')} className="col-span-3" />
                                                {editErrors.email && <div className="col-span-4 text-red-500 text-sm">{editErrors.email}</div>}
                                            </div>
                                            
                                            <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                                <label htmlFor="home_address" className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300">Home Address</label>
                                                <Input id="home_address" value={editedUser.home_address || ''} onChange={(e) => handleEditChange(e, 'home_address')} className="col-span-3" />
                                                {editErrors.home_address && <div className="col-span-4 text-red-500 text-sm">{editErrors.home_address}</div>}
                                            </div>
                                            
                                            <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                                <label htmlFor="country" className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300">Country</label>
                                                <Input id="country" value={editedUser.country || ''} onChange={(e) => handleEditChange(e, 'country')} className="col-span-3" />
                                                {editErrors.country && <div className="col-span-4 text-red-500 text-sm">{editErrors.country}</div>}
                                            </div>
                                            
                                            {/* Add the new select field */}
                                            <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                                <label htmlFor="user_type" className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300">User Type</label>
                                                <Select value={editedUser.user_type || ''} onValueChange={(value) => handleSelectChange('user_type', value)}>
                                                    <SelectTrigger className="col-span-3">
                                                        <SelectValue placeholder="Select User Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="user">Regular User</SelectItem>
                                                        <SelectItem value="premium">Premium User</SelectItem>
                                                        <SelectItem value="vip">VIP User</SelectItem>
                                                        <SelectItem value="suspended">Suspended</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {editErrors.user_type && <div className="col-span-4 text-red-500 text-sm">{editErrors.user_type}</div>}
                                            </div>
                                            
                                            <div className="flex justify-end mt-4">
                                                <Button type="submit" disabled={isEditingUser}>
                                                    {isEditingUser ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        viewedUser && (
                                            <div className="space-y-2">
                                                <p><strong>ID:</strong> {viewedUser.id}</p>
                                                <p><strong>Name:</strong> {viewedUser.name}</p>
                                                <p><strong>Email:</strong> {viewedUser.email}</p>
                                                <p><strong>Status:</strong> {viewedUser.status || 'N/A'}</p>
                                                <p><strong>User Type:</strong> {viewedUser.user_type || 'N/A'}</p>
                                                <p><strong>Joined:</strong> {new Date(viewedUser.created_at).toLocaleDateString()}</p>
                                                {viewedUser.bank_accounts && viewedUser.bank_accounts.length > 0 && (
                                                    <div className="mt-4">
                                                        <h3 className="font-semibold">Bank Accounts:</h3>
                                                        {viewedUser.bank_accounts.map((account, index) => (
                                                            <div key={index} className="ml-4 border-l pl-2 mt-2">
                                                                <p><strong>Bank Name:</strong> {account.bank_name}</p>
                                                                <p><strong>Account Name:</strong> {account.account_name}</p>
                                                                <p><strong>Account Number:</strong> {account.account_number}</p>
                                                                <p><strong>Currency:</strong> {account.currency}</p>
                                                                <p><strong>SWIFT Code:</strong> {account.swift_code}</p>
                                                                <p><strong>IBAN:</strong> {account.iban || 'N/A'}</p>
                                                                {/* <p><strong>Home Address:</strong> {account.home_address || 'N/A'}</p> */}
                                                                <p><strong>Bank Address:</strong> {account.bank_address || 'N/A'}</p>
                                                                <p><strong>Primary:</strong> {account.is_primary ? 'Yes' : 'No'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <p><strong>Home Address:</strong> {viewedUser.home_address || 'N/A'}</p>
                                                <p><strong>Country:</strong> {viewedUser.country || 'N/A'}</p>
                                                <div className="flex justify-end pt-4">
                                                    <Button onClick={handleEdit}>Edit</Button>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="table"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            <CustomTable
                                data={tableData}
                                selectedItems={selectedUsers}
                                setSelectedItems={setSelectedUsers}
                                toggleItem={toggleUser}
                                pageType="accounts"
                                title={'USER ACCOUNTS'}
                                caption={'A list of your registered users.'}
                                headers={tableHeaders}
                                additionalButton={
                                    <Dialog open={openAddAccount} onOpenChange={setOpenAddAccount}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Account
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="mx-auto p-6 max-h-[85vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Add New Account</DialogTitle>
                                                <DialogDescription>Fill in the details for the new account.</DialogDescription>
                                            </DialogHeader>
                                            {/* Wrap your add account form in a <form> tag */}
                                            <form onSubmit={handleAddAccountSubmit} className="grid gap-4 py-4">
                                                {/* User Select */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="user_id"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        User
                                                    </label>
                                                    <Select value={newAccountData.user_id} onValueChange={(value) => setNewAccountData('user_id', value)}>
                                                        <SelectTrigger className="col-span-3">
                                                            <SelectValue placeholder="Select User" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {users.data?.map((user) => (
                                                                <SelectItem 
                                                                    key={String(user.id)}
                                                                    value={String(user.id)}
                                                                >
                                                                    {user.name}
                                                                </SelectItem>
                                                            )) || []}
                                                        </SelectContent>
                                                        
                                                    </Select>
                                                    {addAccountErrors.user_id && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.user_id}</div>}
                                                </div>

                                                {/* Bank Name */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="bank_name"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Bank Name
                                                    </label>
                                                    <Input
                                                        id="bank_name"
                                                        value={newAccountData.bank_name}
                                                        onChange={(e) => setNewAccountData('bank_name', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.bank_name && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.bank_name}</div>}
                                                </div>

                                                {/* Account Name */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="account_name"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Account Name
                                                    </label>
                                                    <Input
                                                        id="account_name"
                                                        value={newAccountData.account_name}
                                                        onChange={(e) => setNewAccountData('account_name', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.account_name && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.account_name}</div>}
                                                </div>

                                                {/* Account Number */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="account_number"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Account Number
                                                    </label>
                                                    <Input
                                                        id="account_number"
                                                        value={newAccountData.account_number}
                                                        onChange={(e) => setNewAccountData('account_number', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.account_number && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.account_number}</div>}
                                                </div>

                                                {/* Currency */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="currency"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Currency
                                                    </label>
                                                    <Input
                                                        id="currency"
                                                        value={newAccountData.currency}
                                                        onChange={(e) => setNewAccountData('currency', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.currency && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.currency}</div>}
                                                </div>

                                                {/* SWIFT Code */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="swift_code"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        SWIFT Code
                                                    </label>
                                                    <Input
                                                        id="swift_code"
                                                        value={newAccountData.swift_code}
                                                        onChange={(e) => setNewAccountData('swift_code', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.swift_code && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.swift_code}</div>}
                                                </div>

                                                {/* IBAN */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="iban"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        IBAN <span className="text-gray-500">(Optional)</span>
                                                    </label>
                                                    <Input
                                                        id="iban"
                                                        value={newAccountData.iban}
                                                        onChange={(e) => setNewAccountData('iban', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.iban && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.iban}</div>}
                                                </div>

                                                {/* Bank Address */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="bank_address"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Bank Address
                                                    </label>
                                                    <Input
                                                        id="bank_address"
                                                        value={newAccountData.bank_address}
                                                        onChange={(e) => setNewAccountData('bank_address', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.bank_address && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.bank_address}</div>}
                                                </div>

                                                {/* Home Address */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="home_address"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Home Address
                                                    </label>
                                                    <Input
                                                        id="home_address"
                                                        value={newAccountData.home_address}
                                                        onChange={(e) => setNewAccountData('home_address', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.home_address && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.home_address}</div>}
                                                </div>

                                                 {/* Country */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="country"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Country
                                                    </label>
                                                    <Input
                                                        id="country"
                                                        value={newAccountData.country}
                                                        onChange={(e) => setNewAccountData('country', e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                    {addAccountErrors.country && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.country}</div>}
                                                </div>

                                                {/* Is Primary Checkbox */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <div />
                                                    <div className="col-span-3 flex items-center space-x-2">
                                                        <Checkbox
                                                            id="is_primary"
                                                            checked={newAccountData.is_primary}
                                                            onCheckedChange={(checked) => setNewAccountData('is_primary', Boolean(checked))}
                                                        />
                                                        <label
                                                            htmlFor="is_primary"
                                                            className="text-sm leading-none font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300"
                                                        >
                                                            Set as Primary Account
                                                        </label>
                                                    </div>
                                                    {addAccountErrors.is_primary && <div className="col-span-4 text-red-500 text-sm">{addAccountErrors.is_primary}</div>}
                                                </div>
                                                <div className="flex justify-end pt-4">
                                                    <Button type="submit" disabled={isAddingAccount}>
                                                        {isAddingAccount ? 'Adding...' : 'Add Account'}
                                                    </Button>
                                                </div>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                }
                                onView={handleView}
                                showViewButton={true}
                                showPagination={true}
                                pagination={users.meta}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}