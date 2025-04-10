import { Button } from "@/components/ui/button";
import {  CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

// Sample wallet addresses - replace with your actual addresses
const walletAddresses = {
  bitcoin: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ethereum: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  usdt: "0x8A9424745056Eb399FD19a0EC26A14316684e274"
};


export default function DepositPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (address: string, type: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 3000);
  };

  const renderQrCode = (value: string, size: number = 150) => {
    // This would normally use a QR code library, but for now we'll use a placeholder
    return (
      <div className="flex items-center justify-center mb-4">
        <img 
          src={`/api/placeholder/${size}/${size}`} 
          alt="QR Code" 
          className="border border-gray-200 rounded-md"
        />
      </div>
    );
  };

  return (
    <>
    <CardHeader className="text-center">
            {/* <CardTitle className="text-2xl"></CardTitle> */}
            <CardDescription className='mt-4'>
              Send crypto to the following addresses to fund your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert variant="warning" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure to send only the specified cryptocurrency to its matching address. 
                Sending to the wrong network may result in permanent loss of funds.
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="bitcoin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
                <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                <TabsTrigger value="usdt">USDT</TabsTrigger>
              </TabsList>
              
              {Object.entries(walletAddresses).map(([network, address]) => (
                <TabsContent key={network} value={network} className="space-y-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-lg font-semibold mb-2 capitalize">{network} Address</div>
                    {renderQrCode(address)}
                    
                    <div className="relative w-full">
                      <div className="p-3 bg-zinc-900 text-neutral-300 rounded-md font-mono text-sm break-all">
                        {address}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(address, network)}
                      >
                        {copiedAddress === network ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="mt-8 space-y-4">
              <h3 className="font-medium">Important Notes:</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                <li>Your deposit will be credited after 2 network confirmations</li>
                <li>Minimum deposit amount: 0.001 BTC / 0.01 ETH / 10 USDT</li>
                <li>Processing time depends on network congestion and may take up to 30 minutes</li>
                <li>For large deposits (over $10,000), please contact support</li>
              </ul>
            </div>
          </CardContent>
    </>
     
  );
}