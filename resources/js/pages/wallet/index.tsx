import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, Check, Clock, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';

// Define TypeScript interfaces for type safety
interface WalletCard {
    id: string;
    name?: string;
    lastFour: string;
    balance: number;
    cardType: 'visa' | 'mastercard' | 'paypal' | 'bank';
    status: 'active' | 'pending' | 'locked';
    isPreferred?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Wallet',
        href: '/wallet',
    },
];

export default function Index() {
    // State to track selected card
    const [selectedCard, setSelectedCard] = useState<string | null>(null);

    // Example wallet cards data
    const walletCards: WalletCard[] = [
        {
            id: '1',
            lastFour: '1234',
            balance: 1000.0,
            cardType: 'visa',
            status: 'active',
            isPreferred: true,
        },
        {
            id: '2',
            name: 'Bob Carter',
            lastFour: '4819',
            balance: 43.62,
            cardType: 'mastercard',
            status: 'active',
        },
        {
            id: '3',
            name: 'Mason Mount',
            lastFour: '8714',
            balance: 80.0,
            cardType: 'paypal',
            status: 'pending',
        },
        {
            id: '4',
            name: 'Mark Davis',
            lastFour: '9814',
            balance: 68.39,
            cardType: 'visa',
            status: 'locked',
        },
        {
            id: '5',
            name: 'Selena Gomez',
            lastFour: '5681',
            balance: 2589.0,
            cardType: 'bank',
            status: 'locked',
        },
    ];

    // Helper function to render card logo
    const renderCardLogo = (cardType: string) => {
        switch (cardType) {
            case 'visa':
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-600 text-white">
                        <span className="text-xs font-bold">VISA</span>
                    </div>
                );
            case 'mastercard':
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-orange-500 text-white">
                        <span className="text-xs font-bold">MC</span>
                    </div>
                );
            case 'paypal':
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-xl font-bold text-blue-700">P</span>
                    </div>
                );
            case 'bank':
                return (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-gray-700">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                <line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                        </span>
                    </div>
                );
            default:
                return null;
        }
    };

    // Helper function to render status icon
    const renderStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Check size={18} className="text-green-500" />;
            case 'pending':
                return <Clock size={18} className="text-yellow-500" />;
            case 'locked':
                return <AlertCircle size={18} className="text-gray-500" />;
            default:
                return null;
        }
    };

    const handleCardClick = (cardId: string) => {
        setSelectedCard(cardId);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wallet" />
            <Card className="w-full">
                <div className="flex flex-col gap-4 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Wallet</h1>
                        <Button variant="primary" className="flex items-center rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            <Plus size={18} className="mr-2" /> New Card
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {walletCards.map((card) => {
                            // Dynamic styling based on card state
                            const isSelected = selectedCard === card.id;
                            const isPreferred = card.isPreferred;

                            return (
                                <div
                                    key={card.id}
                                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all ${isPreferred ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-gray-800' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'} ${!isPreferred ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} dark:text-white`}
                                    onClick={() => handleCardClick(card.id)}
                                >
                                    <div className="flex items-center space-x-4">
                                        {renderCardLogo(card.cardType)}
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                {renderStatusIcon(card.status)}
                                                {card.name && (
                                                    <>
                                                        <span className="font-medium">{card.name}</span>
                                                        <span className="text-gray-500 dark:text-gray-400">•</span>
                                                    </>
                                                )}
                                                <span className="text-gray-500 dark:text-gray-400">**** {card.lastFour}</span>
                                                {card.isPreferred && (
                                                    <span className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white">Preferred</span>
                                                )}
                                            </div>
                                            <div className="text-lg font-semibold">${card.balance.toFixed(2)}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <MoreHorizontal size={16} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </AppLayout>
    );
}
