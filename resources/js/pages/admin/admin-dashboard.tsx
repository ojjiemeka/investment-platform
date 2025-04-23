import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronUp, Users as UsersIcon } from 'lucide-react'; // Renamed Users to UsersIcon to avoid conflict
import { useState, useEffect } from 'react'; // Removed unused imports
import CustomTable from '@/components/admin-table';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddUserButton from '@/components/new-user-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/wallet/admin/dashboard',
    },
];

// Define the structure of the user data expected by this component
interface UserData {
    id: string | number;
    name: string; // User's name
    email: string; // User's email
    is_active: boolean; // User's active status from backend

    // Field that may require additional backend changes to populate with real data
    balance: number; // Placeholder unless backend provides aggregate balance
}

// Define the structure of the users prop from Laravel Inertia pagination
interface UsersProp {
    data: {
        id: number;
        name: string;
        email: string;
        created_at: string;
        is_active: boolean; // Assuming 'is_active' is selected by the backend
        // Add other fields if your Laravel query selects them
    }[];
    // Pagination link structure
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    total: number;
}

// Define the props for the AdminDashboard component, including stats props
interface AdminDashboardProps {
    users: UsersProp; // Paginated user data from backend
    totalUsersCount: number; // Total users count from backend
    totalBankAccountsCount: number; // Total bank accounts count from backend
    pendingRequestsCount: number; // Total pending requests count from backend
}

export default function AdminDashboard({ users, totalUsersCount, totalBankAccountsCount, pendingRequestsCount }: AdminDashboardProps) {
    // Map the incoming users data to the structure expected by the component state
    const initialUsersList: UserData[] = users.data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        // created_at is still needed for the joinDate derivation if you re-add it later
        created_at: user.created_at,
        is_active: user.is_active, // Use actual data from backend

        // These fields are not in the User model and require backend changes to populate
        balance: 0.00, // Default value - adjust if your backend provides balance (e.g., from bankAccounts relationship)
    }));

    // State to manage the list of users displayed in the table
    const [usersList, setUsersList] = useState<UserData[]>(initialUsersList);
    // State to manage selected user IDs
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    // State to manage the currently viewed user details
    const [viewedUser, setViewedUser] = useState<UserData | null>(null);
    // State to manage if the user details are being edited
    const [isEditing, setIsEditing] = useState(false);
    // State to manage the data of the user currently being edited
    const [editedUser, setEditedUser] = useState<UserData | null>(null);

    // Update usersList state if the users prop changes (e.g., pagination)
    // This ensures the table updates when you navigate between pages
    useEffect(() => {
        setUsersList(initialUsersList);
    }, [users.data]); // Dependency array includes users.data - re-run when data changes

    // Toggle selection for a user by ID
    const toggleUserSelection = (id: string | number) => {
        const idString = String(id); // Ensure consistency by working with string IDs
        if (selectedUserIds.includes(idString)) {
            setSelectedUserIds(selectedUserIds.filter((userId) => userId !== idString));
        } else {
            setSelectedUserIds([...selectedUserIds, idString]);
        }
    };

    // Handle viewing a specific user's details
    const handleViewUser = (user: UserData) => {
        setViewedUser(user);
    };

    // Handle initiating the edit process for the viewed user
    const handleEditUser = () => {
        if (viewedUser) {
            // Create a copy to edit
            setEditedUser({ ...viewedUser });
            setIsEditing(true);
        }
    };

    // Handle changes in the edit form inputs (excluding status select)
    // Use keyof UserData for type-safe field access
    const handleEditUserChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof UserData) => {
        if (editedUser) {
             // Handle input and select changes
            const value = event.target.value;
            // Only update if the field is not derived or handled separately (like status)
            if (field !== 'is_active') { // is_active is handled by handleStatusChange
                 setEditedUser({ ...editedUser, [field]: value as any }); // Use 'as any' temporarily for non-string fields if needed, or refine types
            }
        }
    };

     // Handle changes specifically for the status select, updating only is_active boolean
     const handleStatusChange = (value: string) => {
        if (editedUser) {
            // Update only the is_active boolean based on the selected status string
            setEditedUser({
                ...editedUser,
                is_active: value === 'Active'
            });
        }
    };

    // Handle submitting the edited user data
    const handleSubmit = () => {
        if (editedUser) {
            // Here you would typically send the editedUser data to your backend
            // You would likely send editedUser.id and editedUser.is_active
            console.log("Submitted:", editedUser);
            // Update the usersList state with the edited user
            setUsersList(usersList.map(user =>
                user.id === editedUser.id ? editedUser : user
            ));
            setViewedUser(editedUser); // Update the viewed user to show latest changes
            setIsEditing(false); // Exit editing mode
        }
    };

    // Handle adding a new user (e.g., from a modal form)
    const handleUserAdded = (newUser: UserData) => {
        // Add the new user to the usersList array
        setUsersList([...usersList, newUser]);
    };

    // Dashboard statistics data - now using props from the backend
    const dashboardStats = [
        {
            title: 'Total Users',
            value: totalUsersCount.toLocaleString(), // Use prop data, formatted
            change: '+47', // Placeholder - you might get this from backend too
            icon: UsersIcon, // Using the renamed icon import
            positive: true, // Placeholder
        },
        {
            title: 'Total Bank Accounts',
            value: totalBankAccountsCount.toLocaleString(), // Use prop data, formatted
            change: '+72', // Placeholder
            icon: UsersIcon, // Using the renamed icon import
            positive: true, // Placeholder
        },
        {
            title: 'Pending requests',
            value: pendingRequestsCount.toLocaleString(), // Use prop data, formatted
            change: '-49', // Placeholder
            icon: UsersIcon, // Using the renamed icon import
            positive: false, // Placeholder
        },
    ];

    // Type annotation for tableHeaders
    const tableHeaders: React.ReactNode[] = [
        <div key="col-id" className='w-10'>#</div>,
        <div key="col-name" className="flex items-center space-x-1">
            <span>Account Name</span> {/* Keeping "Account Name" as it fits the context of users having accounts */}
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-balance" className="flex items-center space-x-1">
            <span>Balance &nbsp; ($)</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-email" className="hidden sm:table-cell flex items-center space-x-1">
            <span>Email</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-status" className="hidden md:table-cell flex items-center space-x-1">
            <span>Status</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" /> {/* Updated title */}
            <div className="flex h-full flex-col gap-6 p-4 md:p-6">
                {/* Dashboard Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dashboardStats.map((stat, index) => (
                        <Card key={index} className="bg-white shadow-sm dark:bg-zinc-800">
                            <CardContent className="p-4 md:p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 md:space-y-2">
                                        <div className="flex items-baseline">
                                            {/* Use toLocaleString for number formatting */}
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
                    {viewedUser ? (
                        <motion.div
                            key={isEditing ? "editPage" : "viewPage"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            <Card className="bg-white shadow-sm dark:bg-zinc-800 p-4">
                                <div className="p-2 flex justify-between items-center">
                                    <h1>{isEditing ? "Edit Account Details" : "Account Details"}</h1>
                                    <Button onClick={() => isEditing ? setIsEditing(false) : setViewedUser(null)}>
                                        {isEditing ? "Cancel" : "Close"}
                                    </Button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Account Name</label>
                                                <Input
                                                    value={editedUser?.name || ''}
                                                    onChange={(e) => handleEditUserChange(e, "name")}
                                                    placeholder="Account Name"
                                                    className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Balance</label>
                                                <Input
                                                    value={editedUser?.balance || 0}
                                                    onChange={(e) => handleEditUserChange(e, "balance")}
                                                    placeholder="Balance"
                                                    className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Email</label>
                                                <Input
                                                    value={editedUser?.email || ''}
                                                    onChange={(e) => handleEditUserChange(e, "email")}
                                                    placeholder="Email"
                                                    className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Status</label>
                                                {/* Derive value from editedUser?.is_active */}
                                                <Select value={editedUser?.is_active ? 'Active' : 'Inactive'} onValueChange={handleStatusChange}>
                                                    <SelectTrigger className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white">
                                                        <SelectValue placeholder="Select Status" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-800 border border-zinc-700 rounded-md">
                                                        <SelectItem value="Active" className="text-white">Active</SelectItem>
                                                        <SelectItem value="Inactive" className="text-white">Inactive</SelectItem>
                                                        <SelectItem value="Onboarding" className="text-white">Onboarding</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button onClick={handleSubmit} className="w-full bg-blue-600 text-white hover:bg-zinc-700">Submit</Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Account Name</label>
                                                <Input value={viewedUser?.name || ''} readOnly className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Balance</label>
                                                <Input value={viewedUser?.balance || 0} readOnly className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Email</label>
                                                <Input value={viewedUser?.email || ''} readOnly className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Status</label>
                                                {/* Derive value from viewedUser?.is_active */}
                                                <Input value={viewedUser?.is_active ? 'Active' : 'Inactive'} readOnly className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white" />
                                            </div>
                                            <Button onClick={handleEditUser} className="w-full bg-blue-600 text-white hover:bg-zinc-700">Edit</Button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <CustomTable
                            data={usersList}
                            selectedItems={selectedUserIds}
                            setSelectedItems={setSelectedUserIds}
                            toggleItem={toggleUserSelection}
                            title={"ACCOUNTS SUMMARY"}
                            caption={"A list of your recent users."}
                            headers={tableHeaders}
                            additionalButton={<AddUserButton onUserAdded={handleUserAdded} />}
                            onView={handleViewUser}
                        />
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
