import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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
    onUserAdded: (newUser: any) => void; // Function to handle new user data
}

const AddUserButton: React.FC<AddUserButtonProps> = ({ onUserAdded }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [balance, setBalance] = useState('');
    const [status, setStatus] = useState('');

    const handleAddUser = () => {
        const newUser = {
            id: String(Date.now()), // Generate a unique ID
            name,
            email,
            balance: parseFloat(balance),
            status,
        };
        onUserAdded(newUser); // Pass the new user data to the parent component
        setOpen(false);
        // Reset form fields
        setName('');
        setEmail('');
        setBalance('');
        setStatus('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='hover:bg-zinc-700 hover:text-white'>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new user.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm font-medium leading-none text-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Name
                        </label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="email" className="text-right text-sm font-medium leading-none text-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Email
                        </label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="balance" className="text-right text-sm font-medium leading-none text-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Balance
                        </label>
                        <Input id="balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="status" className="text-right text-sm font-medium leading-none text-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Status
                        </label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Onboarding">Onboarding</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button type="button" onClick={handleAddUser}>Add User</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddUserButton;