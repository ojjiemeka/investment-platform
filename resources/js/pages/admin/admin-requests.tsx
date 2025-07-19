// admindashboard.tsx
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@headlessui/react';
import { AlertCircle, Building, ChevronUp, CreditCard, Users, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import CustomTable from '@/components/admin-table';
import DashboardStats from '@/components/dashboardStats';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Requests',
        href: '/wallet/admin/requests',
    },
];


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
    // data: User[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: PaginationMeta;
}
interface AdminRequestProps {
    users: PaginatedUsers;
    totalUsersCount: number;
    totalBankAccountsCount: number;
    pendingRequestsCount: number;
    totalPortfoliosCount?: number;
    inactiveAccountsCount?: number;
}


// Employee statistics data
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

// Employee data
const employees = [
    {
        id: 'A01DSGN193',
        name: 'Randy Rhiel Madsen',
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
    {
        id: 'A05DEVP381',
        name: 'Cheyenne Bothman',
        email: 'bothmancyn@email.com',
        avatar: '/avatars/cheyenne.jpg',
        jobTitle: 'iOS Developer',
        department: 'Developer Team',
        joinDate: '20 February 2025',
        status: 'Onboarding',
    },
    {
        id: 'A04DEVP312',
        name: 'Alfredo Curtis',
        email: 'alfredocurt@email.com',
        avatar: '/avatars/alfredo.jpg',
        jobTitle: 'Android Developer',
        department: 'Developer Team',
        joinDate: '14 May 2024',
        status: 'Active',
    },
    {
        id: 'A03DEVP273',
        name: 'Ryan Saris Lewis',
        email: 'ryansaris@email.com',
        avatar: '/avatars/ryan.jpg',
        jobTitle: 'Back-End Developer',
        department: 'Developer Team',
        joinDate: '31 July 2024',
        status: 'Active',
    },
    {
        id: 'A02MRKT028',
        name: 'Giana Botosh',
        email: 'botosh.giana@email.com',
        avatar: '/avatars/giana.jpg',
        jobTitle: 'Digital Marketing',
        department: 'Marketing Team',
        joinDate: '04 December 2022',
        status: 'Inactive',
    },
];

export default function AdminDashboard({
    totalUsersCount = 0,
    totalBankAccountsCount = 0,
    pendingRequestsCount = 0,
    totalPortfoliosCount,
}: AdminRequestProps ) {
    
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

    const toggleEmployee = (id: string) => {
        if (selectedEmployees.includes(id)) {
            setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
        } else {
            setSelectedEmployees([...selectedEmployees, id]);
        }
    };

    const tableHeaders = [
        <div className='w-10'>#</div>,
        <div className="flex items-center space-x-1">
            <span>Account Name</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div className="flex items-center space-x-1">
            <span>Email</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div className="hidden sm:table-cell flex items-center space-x-1">
            <span>Type</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
        <div className="hidden md:table-cell flex items-center space-x-1">
            <span>Status</span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                <ChevronUp className="h-3 w-3" />
            </Button>
        </div>,
    ];

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
        ...(totalPortfoliosCount !== undefined
            ? [
                  {
                      title: 'Total Portfolios',
                      value: totalPortfoliosCount.toLocaleString(),
                      change: '+15',
                      icon: Building,
                      positive: true,
                  },
              ]
            : []),
    ];

    console.log(' user:', totalUsersCount);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Management" />
            <div className="flex h-full flex-col gap-6 p-4 md:p-6">
                <DashboardStats stats={dashboardStats} />
                

                {/* Employee Table */}
                <CustomTable
                    data={employees}
                    selectedItems={selectedEmployees}
                    setSelectedItems={setSelectedEmployees}
                    toggleItem={toggleEmployee}
                    title={"USER REQUESTS"}
                    caption={"A list of your recent invoices."}
                    headers={tableHeaders} // Pass headers here
                />
            </div>
        </AppLayout>
    );
}