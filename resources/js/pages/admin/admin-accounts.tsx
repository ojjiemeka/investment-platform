import CustomTable from '@/components/admin-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronUp, Plus, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Accounts',
        href: '/wallet/admin/accounts',
    },
];

const employeeStats = [
    {
        title: 'Total Users',
        value: '1,384',
        change: '+47',
        icon: Users,
        positive: true,
    },
    {
        title: 'Active Bank Accounts',
        value: '839',
        change: '+72',
        icon: Users,
        positive: true,
    },
    {
        title: 'Inactive employee',
        value: '531',
        change: '-49',
        icon: Users,
        positive: false,
    },
];

const employees = [
    {
        id: 'A01DSGN193',
        name: 'Chase Bank',
        email: 'randyrhiel@email.com',
        avatar: '/avatars/randy.jpg',
        jobTitle: 'UI Designer',
        department: 'Design Team',
        joinDate: '11 August 2022',
        status: 'Active',
    },
    {
        id: 'A02DSGN196',
        name: 'Maria Rosser',
        email: 'rossermar@email.com',
        avatar: '/avatars/maria.jpg',
        jobTitle: 'UX Researcher',
        department: 'Design Team',
        joinDate: '25 June 2021',
        status: 'Inactive',
    },
];

const users = [
    { id: 'user1', name: 'John Doe' },
    { id: 'user2', name: 'Jane Smith' },
    { id: 'user3', name: 'Alice Johnson' },
];

export default function AdminDashboard() {
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [viewedEmployee, setViewedEmployee] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState<any>(null);
    const [openAddAccount, setOpenAddAccount] = useState(false);

    const [newUserId, setNewUserId] = useState('');
    const [newBankName, setNewBankName] = useState('');
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountNumber, setNewAccountNumber] = useState('');
    const [newCurrency, setNewCurrency] = useState('');
    const [newSwiftCode, setNewSwiftCode] = useState('');
    const [newIban, setNewIban] = useState('');
    const [newBankAddress, setNewBankAddress] = useState('');
    const [newHomeAddress, setNewHomeAddress] = useState('');
    const [newCountry, setNewCountry] = useState('');
    const [newIsPrimary, setNewIsPrimary] = useState(false);

    const toggleEmployee = (id: string) => {
        if (selectedEmployees.includes(id)) {
            setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
        } else {
            setSelectedEmployees([...selectedEmployees, id]);
        }
    };

    const handleView = (employee: any) => {
        setViewedEmployee(employee);
    };

    const handleEdit = () => {
        setEditedEmployee({ ...viewedEmployee });
        setIsEditing(true);
    };

    const handleEditChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
        setEditedEmployee({ ...editedEmployee, [field]: event.target.value });
    };

    const handleSubmit = () => {
        console.log('Submitted:', editedEmployee);
        setViewedEmployee(editedEmployee);
        setIsEditing(false);
    };

    const handleAddAccount = () => {
        const newAccount = {
            id: String(Date.now()),
            user_id: newUserId,
            bank_name: newBankName,
            account_name: newAccountName,
            account_number: newAccountNumber,
            currency: newCurrency,
            swift_code: newSwiftCode,
            iban: newIban,
            bank_address: newBankAddress,
            home_address: newHomeAddress,
            country: newCountry,
            is_primary: newIsPrimary,
        };
        console.log('New Account:', newAccount);
        setOpenAddAccount(false);
        setNewUserId('');
        setNewBankName('');
        setNewAccountName('');
        setNewAccountNumber('');
        setNewCurrency('');
        setNewSwiftCode('');
        setNewIban('');
        setNewBankAddress('');
        setNewHomeAddress('');
        setNewCountry('');
        setNewIsPrimary(false);
    };

    const tableHeaders = [
        <div className="w-10">#</div>,
        <div className="flex items-center space-x-1">
            <span>Bank Name</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div className="flex items-center space-x-1">
            <span>Bank Account Number</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div className="flex hidden items-center space-x-1 sm:table-cell">
            <span>Users</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div className="flex hidden items-center space-x-1 md:table-cell">
            <span>Status</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Management" />
            <div className="flex h-full flex-col gap-6 p-4 md:p-6">
                {/* Employee Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {employeeStats.map((stat, index) => (
                        <Card key={index} className="bg-white shadow-sm dark:bg-zinc-800">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 md:space-y-2">
                                        <div className="flex items-baseline">
                                            <span className="text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">{stat.value}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 md:text-sm dark:text-gray-400">{stat.title}</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                                        <stat.icon className="h-4 w-4 text-gray-500 md:h-5 md:w-5 dark:text-gray-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {viewedEmployee ? (
                        <motion.div
                            key={isEditing ? 'editPage' : 'viewPage'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                        >
                            {/* ... (Edit and View Modal logic remains the same) ... */}
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
                                data={employees}
                                selectedItems={selectedEmployees}
                                setSelectedItems={setSelectedEmployees}
                                toggleItem={toggleEmployee}
                                title={'BANK ACCOUNTS'}
                                caption={'A list of your recent accounts.'}
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
                                            {' '}
                                            {/* Updated class */}
                                            <DialogHeader>
                                                <DialogTitle>Add New Account</DialogTitle>
                                                <DialogDescription>Fill in the details for the new account.</DialogDescription>
                                            </DialogHeader>
                                            {/* Rest of the form grid */}
                                            <div className="grid gap-4 py-4">
                                                {/* User Select */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="user_id"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        User
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Select value={newUserId} onValueChange={setNewUserId}>
                                                        {' '}
                                                        {/* Removed className="col-span-3" */}
                                                        <SelectTrigger className="col-span-3">
                                                            {' '}
                                                            {/* Added col-span-3 here */}
                                                            <SelectValue placeholder="Select User" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {users.map((user) => (
                                                                <SelectItem key={user.id} value={user.id}>
                                                                    {user.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Bank Name */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="bank_name"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Bank Name
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Input
                                                        id="bank_name"
                                                        value={newBankName}
                                                        onChange={(e) => setNewBankName(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* Account Name */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="account_name"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Account Name
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Input
                                                        id="account_name"
                                                        value={newAccountName}
                                                        onChange={(e) => setNewAccountName(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* Account Number */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="account_number"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Account Number
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Input
                                                        id="account_number"
                                                        value={newAccountNumber}
                                                        onChange={(e) => setNewAccountNumber(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* Currency */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="currency"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Currency
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Input
                                                        id="currency"
                                                        value={newCurrency}
                                                        onChange={(e) => setNewCurrency(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* SWIFT Code */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="swift_code"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        SWIFT Code
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Input
                                                        id="swift_code"
                                                        value={newSwiftCode}
                                                        onChange={(e) => setNewSwiftCode(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* IBAN */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="iban"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        IBAN <span className="text-gray-500">(Optional)</span>
                                                    </label>{' '}
                                                    {/* Adjusted text color & optional text */}
                                                    <Input
                                                        id="iban"
                                                        value={newIban}
                                                        onChange={(e) => setNewIban(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* Bank Address */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="bank_address"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Bank Address
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Input
                                                        id="bank_address"
                                                        value={newBankAddress}
                                                        onChange={(e) => setNewBankAddress(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* Home Address */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="home_address"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Home Address
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Input
                                                        id="home_address"
                                                        value={newHomeAddress}
                                                        onChange={(e) => setNewHomeAddress(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* Country */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <label
                                                        htmlFor="country"
                                                        className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                                                    >
                                                        Country
                                                    </label>{' '}
                                                    {/* Adjusted text color */}
                                                    <Input
                                                        id="country"
                                                        value={newCountry}
                                                        onChange={(e) => setNewCountry(e.target.value)}
                                                        className="col-span-3"
                                                    />
                                                </div>

                                                {/* Is Primary Checkbox - Improved Layout */}
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <div /> {/* Empty cell for alignment */}
                                                    <div className="col-span-3 flex items-center space-x-2">
                                                        <Checkbox
                                                            id="is_primary"
                                                            checked={newIsPrimary}
                                                            // Use boolean for onCheckedChange if using shadcn/ui >= some version
                                                            // Check your Checkbox component's documentation
                                                            onCheckedChange={(checked) => setNewIsPrimary(Boolean(checked))}
                                                            // For older versions or if it expects a boolean:
                                                            // onCheckedChange={setNewIsPrimary}
                                                        />
                                                        <label
                                                            htmlFor="is_primary"
                                                            className="text-sm leading-none font-medium text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300" // Adjusted text color
                                                        >
                                                            Set as Primary Account
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                {' '}
                                                {/* Added padding-top */}
                                                <Button type="button" onClick={handleAddAccount}>
                                                    Add Account
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                }
                                onView={handleView}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
