import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatItem {
    title: string;
    value: string;
    change?: string;
    icon: LucideIcon;
    positive?: boolean;
}

interface DashboardStatsProps {
    stats: StatItem[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="bg-white shadow-sm dark:bg-zinc-800">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-baseline">
                                    <span className="text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">
                                        {stat.value}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 md:text-sm dark:text-gray-400">
                                    {stat.title}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                                <stat.icon className="h-4 w-4 text-gray-500 md:h-5 md:w-5 dark:text-gray-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}