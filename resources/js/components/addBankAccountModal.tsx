import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@inertiajs/react";
import { useState } from "react";

export default function AddBankAccountModal() {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        bank_name: "",
        account_name: "",
        account_number: "",
        currency: "",
        swift_code: "",
        iban: "",
        bank_address: "",
        home_address: "",
        country: "",
        is_primary: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Submitting form data:', data); // 👈 Logs form data before submission

    post(route("bank-requests.store"), {
        onSuccess: () => {
            alert('Bank account Added successfully.');
            reset();
            setOpen(false);
        },
         onError: (errors) => {
                console.error('Error adding bank account:', errors);
                alert('Failed to add bank account. Check console for details.');
            },
    });
};


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="primary" className="flex items-center rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    Add Account
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Bank Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                            Bank Name
                        </label>
                        <Input
                        value={data.bank_name}
                        onChange={(e) => setData("bank_name", e.target.value)}
                        error={errors.bank_name}
                        className="col-span-3"

                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                            Account Name
                        </label>
                        <Input
                        value={data.account_name}
                        onChange={(e) => setData("account_name", e.target.value)}
                        error={errors.account_name}
                        className="col-span-3"
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                          Account Number  
                        </label>
                        <Input
                        value={data.account_number}
                        onChange={(e) => setData("account_number", e.target.value)}
                        error={errors.account_number}
                        className="col-span-3"
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                            Currency
                        </label>
                        <Input
                        value={data.currency}
                        onChange={(e) => setData("currency", e.target.value)}
                        error={errors.currency}
                        className="col-span-3"
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                            SWIFT Code
                        </label>
                        <Input
                        value={data.swift_code}
                        onChange={(e) => setData("swift_code", e.target.value)}
                        error={errors.swift_code}
                        className="col-span-3"
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                           IBAN 
                        </label>
                        <Input
                        value={data.iban}
                        onChange={(e) => setData("iban", e.target.value)}
                        error={errors.iban}
                        className="col-span-3"
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                        Home Address 
                        </label>
                        <Input
                        value={data.home_address}
                        onChange={(e) => setData("home_address", e.target.value)}
                        error={errors.home_address}
                        className="col-span-3"
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                        Bank Address 
                        </label>
                        <Input
                        value={data.bank_address}
                        onChange={(e) => setData("bank_address", e.target.value)}
                        error={errors.bank_address}
                        className="col-span-3"
                    />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label
                            htmlFor="home_address"
                            className="text-right text-sm leading-none font-medium text-gray-700 dark:text-gray-300"
                        >
                        Country
                        </label>
                        <Input
                        value={data.country}
                        onChange={(e) => setData("country", e.target.value)}
                        error={errors.country}
                        className="col-span-3"
                    />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : "Save Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
