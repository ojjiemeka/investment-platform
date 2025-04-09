
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WithdrawForm() {
  return (
    <div>
       <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required />
        </div>
       </div>
  );
}