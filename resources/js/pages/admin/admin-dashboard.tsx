import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronUp, User, Users as UsersIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import CustomTable from '@/components/admin-table';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddUserButton from '@/components/new-user-form';
import { router } from '@inertiajs/react';
import DashboardStats from '@/components/dashboardStats'; // Import the new component

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/wallet/admin/dashboard',
    },
];

// Define Portfolio interface
interface Portfolio {
    id: number;
    user_id: number;
    name?: string;
    balance: number;
    created_at: string;
    updated_at: string;
}

// Updated UserData interface to include portfolios
interface UserData {
    id: string | number;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
    // Portfolio-related fields
    portfolios: Portfolio[];
    portfolios_count?: number;
    total_balance: number; // Calculated total balance from all portfolios
}

// Updated structure from Laravel backend
interface UsersProp {
    data: {
        id: number;
        name: string;
        email: string;
        created_at: string;
        is_active: boolean;
        // Portfolio relationship data
        portfolios: Portfolio[];
        portfolios_count?: number;
    }[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    current_page: number;
    last_page: number;
    total: number;
}

interface AdminDashboardProps {
    users: UsersProp;
    totalUsersCount: number;
    totalBankAccountsCount: number;
    pendingRequestsCount: number;
    totalPortfoliosCount?: number; // Add this if you're tracking total portfolios
}

// Helper function to calculate total portfolio balance
const calculateTotalBalance = (portfolios: Portfolio[]): number => {
    return portfolios?.reduce((total, portfolio) => total + (portfolio.balance || 0), 0) || 0;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
};

export default function AdminDashboard({ 
    users, 
    totalUsersCount, 
    totalBankAccountsCount, 
    pendingRequestsCount,
    totalPortfoliosCount 
}: AdminDashboardProps) {
    
    // Debug: Log the received data to check portfolio structure
    useEffect(() => {
        console.log('=== DEBUGGING RECEIVED DATA ===');
        console.log('Users data:', users);
        console.log('First user:', users.data?.[0]);
        console.log('First user portfolios:', users.data?.[0]?.portfolios);
        console.log('============================');
    }, [users]);

    // Map the incoming users data with portfolio information
    const initialUsersList: UserData[] = users.data.map(user => {
        const totalBalance = calculateTotalBalance(user.portfolios || []);
        
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            is_active: user.is_active,
            // Portfolio data
            portfolios: user.portfolios || [],
            portfolios_count: user.portfolios_count || user.portfolios?.length || 0,
            total_balance: totalBalance,
        };
    });

    // State management
    const [usersList, setUsersList] = useState<UserData[]>(initialUsersList);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [viewedUser, setViewedUser] = useState<UserData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<UserData | null>(null);

    // Update usersList when users prop changes
    useEffect(() => {
        const updatedList = users.data.map(user => {
            const totalBalance = calculateTotalBalance(user.portfolios || []);
            
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
                is_active: user.is_active,
                portfolios: user.portfolios || [],
                portfolios_count: user.portfolios_count || user.portfolios?.length || 0,
                total_balance: totalBalance,
            };
        });
        setUsersList(updatedList);
    }, [users.data]);

    // Toggle selection for a user by ID
    const toggleUserSelection = (id: string | number) => {
        const idString = String(id);
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
            setEditedUser({ ...viewedUser });
            setIsEditing(true);
        }
    };

    // Handle changes in the edit form inputs
    const handleEditUserChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof UserData) => {
        if (editedUser) {
            const value = event.target.value;
            if (field !== 'is_active') {
                setEditedUser({ ...editedUser, [field]: value as any });
            }
        }
    };

    // Handle status changes
    const handleStatusChange = (value: string) => {
        if (editedUser) {
            setEditedUser({
                ...editedUser,
                is_active: value === 'Active'
            });
        }
    };

    // Handle form submission
    const handleSubmit = () => {
        if (editedUser) {
            const formData = {
                id: editedUser.id,
                name: editedUser.name,
                email: editedUser.email,
                is_active: editedUser.is_active,
                status: editedUser.is_active ? 'Active' : 'Inactive'
            };

            console.log('=== FORM SUBMISSION ===');
            console.log('Complete Form Data:', formData);
            console.log('========================');

            router.put(`/wallet/admin/users/${editedUser.id}`, {
                name: editedUser.name,
                email: editedUser.email,
                is_active: editedUser.is_active,
            }, {
                onStart: () => {
                    console.log('🚀 Starting backend submission...');
                },
                onSuccess: (response) => {
                    console.log('✅ Backend submission successful!', response);
                    
                    setUsersList(usersList.map(user =>
                        user.id === editedUser.id ? editedUser : user
                    ));
                    setViewedUser(editedUser);
                    setIsEditing(false);
                },
                onError: (errors) => {
                    console.error('❌ Backend submission failed:', errors);
                },
                onFinish: () => {
                    console.log('🏁 Backend request finished');
                }
            });
        }
    };

    // Handle adding a new user
    const handleUserAdded = (newUser: UserData) => {
        setUsersList([...usersList, newUser]);
    };

    // Dashboard statistics - now prepared for the DashboardStats component
    const dashboardStats = [
        {
            title: 'Total Users',
            value: totalUsersCount.toLocaleString(),
            change: '+47',
            icon: UsersIcon,
            positive: true,
        },
        {
            title: 'Total Bank Accounts',
            value: totalBankAccountsCount.toLocaleString(),
            change: '+72',
            icon: UsersIcon,
            positive: true,
        },
        {
            title: 'Pending requests',
            value: pendingRequestsCount.toLocaleString(),
            change: '-49',
            icon: UsersIcon,
            positive: false,
        },
        ...(totalPortfoliosCount !== undefined ? [{
            title: 'Total Portfolios',
            value: totalPortfoliosCount.toLocaleString(),
            change: '+15',
            icon: UsersIcon,
            positive: true,
        }] : []),
    ];

    // Updated table headers
    const tableHeaders: React.ReactNode[] = [
        <div key="col-id" className='w-10'>#</div>,
        <div key="col-name" className="flex items-center space-x-1">
            <span>Account Name</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-balance" className="flex items-center space-x-1">
            <span>Total Balance ($)</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div key="col-portfolios" className="hidden sm:table-cell flex items-center space-x-1">
            <span>Portfolios</span>
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
        <div key="col-actions">Actions</div>,
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-col gap-6 p-4 md:p-6">
                {/* Dashboard Statistics Cards - Now using the component */}
                <DashboardStats stats={dashboardStats} />

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
                                    {/* Portfolio Summary Section */}
                                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Portfolio Summary</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
                                                <p className="text-xl font-bold text-green-600">{formatCurrency(viewedUser.total_balance)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Active Portfolios</p>
                                                <p className="text-xl font-bold text-blue-600">{viewedUser.portfolios_count || 0}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Individual Portfolios */}
                                        {viewedUser.portfolios && viewedUser.portfolios.length > 0 && (
                                            <div>
                                                <h4 className="text-md font-medium mb-2 text-gray-800 dark:text-gray-200">Individual Portfolios</h4>
                                                <div className="space-y-2">
                                                    {viewedUser.portfolios.map((portfolio, index) => (
                                                        <div key={portfolio.id} className="flex justify-between items-center p-2 bg-white dark:bg-zinc-800 rounded border">
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                {portfolio.name || `Portfolio ${index + 1}`}
                                                            </span>
                                                            <span className="font-semibold text-green-600">
                                                                {formatCurrency(portfolio.balance)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

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
                                                <label className="block text-sm font-medium text-gray-400">Email</label>
                                                <Input value={viewedUser?.email || ''} readOnly className="bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-400">Status</label>
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
                            pageType="dashboard"
                            title={"ACCOUNTS SUMMARY"}
                            caption={"A list of your recent users with portfolio information."}
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