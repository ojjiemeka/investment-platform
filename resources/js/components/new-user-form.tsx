import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddUserButtonProps {
    onUserAdded: (newUser: any) => void;
}

const AddUserButton: React.FC<AddUserButtonProps> = ({ onUserAdded }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [balance, setBalance] = useState('');
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleAddUser = async () => {
        setErrors({});
        
        const formData = {
            name: name.trim(),
            email: email.trim(),
            balance: balance ? parseFloat(balance) : 0,
            status: status,
            is_active: status === 'Active',
            role: 'user', // Default role
        };

        console.log('=== ADD USER FORM SUBMISSION ===');
        console.log('Complete Form Data:', formData);
        console.log('================================');

        // Client-side validation
        const clientErrors: Record<string, string> = {};
        
        if (!formData.name) {
            clientErrors.name = 'Name is required';
        }
        
        if (!formData.email) {
            clientErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                clientErrors.email = 'Please enter a valid email address';
            }
        }
        
        if (!formData.status) {
            clientErrors.status = 'Status is required';
        }

        if (Object.keys(clientErrors).length > 0) {
            console.warn('⚠️ Client validation failed:', clientErrors);
            setErrors(clientErrors);
            return;
        }

        console.log('✅ Client validation passed - submitting to backend...');
        setIsSubmitting(true);

        try {
            router.post('/wallet/admin/users', {
                name: formData.name,
                email: formData.email,
                balance: formData.balance,
                is_active: formData.is_active,
                role: formData.role,
            }, {
                onStart: () => {
                    console.log('🚀 Starting backend submission...');
                },
                onSuccess: (page) => {
                    console.log('✅ Backend submission successful!', page);
                    
                    // If the backend returns user data, use it
                    const userData = page.props?.user || page.props?.flash?.user;
                    
                    if (userData) {
                        onUserAdded(userData);
                    } else {
                        // Fallback: create user object for local state update
                        const newUser = {
                            id: Date.now(), // Temporary ID
                            name: formData.name,
                            email: formData.email,
                            balance: formData.balance,
                            is_active: formData.is_active,
                            created_at: new Date().toISOString(),
                        };
                        onUserAdded(newUser);
                    }
                    
                    // Close dialog and reset form
                    setOpen(false);
                    resetForm();
                    
                    console.log('🎉 User added successfully!');
                },
                onError: (backendErrors) => {
                    console.error('❌ Backend submission failed:', backendErrors);
                    
                    // Handle Laravel validation errors
                    if (typeof backendErrors === 'object') {
                        setErrors(backendErrors);
                    } else {
                        setErrors({ general: 'Failed to create user. Please try again.' });
                    }
                },
                onFinish: () => {
                    console.log('🏁 Backend request finished');
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('💥 Unexpected error:', error);
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setBalance('');
        setStatus('');
        setErrors({});
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddUser();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='hover:bg-zinc-700 hover:text-white'>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onKeyDown={handleKeyPress}>
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new user. All fields marked with * are required.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm font-medium leading-none text-gray-400">
                            Name *
                        </label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                            }}
                            placeholder="Enter full name"
                            className={`col-span-3 ${errors.name ? 'border-red-500' : ''}`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.name && <p className="col-span-3 col-start-2 text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="email" className="text-right text-sm font-medium leading-none text-gray-400">
                            Email *
                        </label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                            }}
                            placeholder="user@example.com"
                            className={`col-span-3 ${errors.email ? 'border-red-500' : ''}`}
                            required
                            disabled={isSubmitting}
                        />
                        {errors.email && <p className="col-span-3 col-start-2 text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="balance" className="text-right text-sm font-medium leading-none text-gray-400">
                            Balance
                        </label>
                        <Input 
                            id="balance" 
                            type="number" 
                            step="0.01"
                            min="0"
                            value={balance} 
                            onChange={(e) => {
                                setBalance(e.target.value);
                                if (errors.balance) setErrors(prev => ({ ...prev, balance: '' }));
                            }}
                            placeholder="0.00"
                            className={`col-span-3 ${errors.balance ? 'border-red-500' : ''}`}
                            disabled={isSubmitting}
                        />
                        {errors.balance && <p className="col-span-3 col-start-2 text-sm text-red-500 mt-1">{errors.balance}</p>}
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right text-sm font-medium leading-none text-gray-400">
                            Status *
                        </label>
                        <Select 
                            value={status} 
                            onValueChange={(value) => {
                                setStatus(value);
                                if (errors.status) setErrors(prev => ({ ...prev, status: '' }));
                            }}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className={`col-span-3 ${errors.status ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select user status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Onboarding">Onboarding</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="col-span-3 col-start-2 text-sm text-red-500 mt-1">{errors.status}</p>}
                    </div>
                </div>
                
                {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{errors.general}</p>
                    </div>
                )}
                
                <div className="flex justify-between">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                            resetForm();
                            setOpen(false);
                        }}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        onClick={handleAddUser}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding User...' : 'Add User'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddUserButton;