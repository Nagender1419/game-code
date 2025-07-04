import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { Plus, ArrowUp, Lock, AlertTriangle, CreditCard, Building, Wallet as WalletIcon } from "lucide-react";

export default function WalletSection() {
  const [depositAmount, setDepositAmount] = useState("100");
  const [withdrawAmount, setWithdrawAmount] = useState("250");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [withdrawalMethod, setWithdrawalMethod] = useState("bank-1234");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { transactions } = useWallet();

  const depositMutation = useMutation({
    mutationFn: (data: { amount: string; paymentMethod: string }) =>
      apiRequest("POST", "/api/wallet/deposit", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({
        title: "Deposit Successful! 💰",
        description: `$${depositAmount} has been added to your account.`,
      });
      setDepositAmount("100");
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: { amount: string; withdrawalMethod: string }) =>
      apiRequest("POST", "/api/wallet/withdraw", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({
        title: "Withdrawal Requested! 📤",
        description: `$${withdrawAmount} withdrawal is being processed.`,
      });
      setWithdrawAmount("250");
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: "Please check your balance and try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    
    if (amount < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit amount is $100",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({ amount: depositAmount, paymentMethod });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (amount < 250) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is $250",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({ amount: withdrawAmount, withdrawalMethod });
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case "deposit":
        return { label: "Deposit", icon: Plus, color: "bg-green-100 text-green-800" };
      case "withdrawal":
        return { label: "Withdrawal", icon: ArrowUp, color: "bg-orange-100 text-orange-800" };
      case "bet":
        return { label: "Bet", icon: WalletIcon, color: "bg-red-100 text-red-800" };
      case "payout":
        return { label: "Payout", icon: Plus, color: "bg-green-100 text-green-800" };
      default:
        return { label: type, icon: WalletIcon, color: "bg-gray-100 text-gray-800" };
    }
  };

  const formatTransactionStatus = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Deposit */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Plus className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Deposit Funds</h2>
                <p className="text-gray-600">Minimum deposit: $100</p>
              </div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    type="number"
                    min="100"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="pl-8"
                    placeholder="100.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Minimum deposit amount is $100</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer">
                      <CreditCard className="text-gray-500" size={20} />
                      <span className="font-medium">Credit/Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center space-x-3 cursor-pointer">
                      <Building className="text-gray-500" size={20} />
                      <span className="font-medium">Bank Transfer</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="wallet" id="digital-wallet" />
                    <Label htmlFor="digital-wallet" className="flex items-center space-x-3 cursor-pointer">
                      <WalletIcon className="text-gray-500" size={20} />
                      <span className="font-medium">Digital Wallet</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button
                type="submit"
                disabled={depositMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <Lock className="mr-2" size={16} />
                {depositMutation.isPending ? "Processing..." : "Secure Deposit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Withdraw */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <ArrowUp className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Withdraw Funds</h2>
                <p className="text-gray-600">Minimum withdrawal: $250</p>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <Input
                    type="number"
                    min="250"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="pl-8"
                    placeholder="250.00"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Minimum withdrawal amount is $250</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Withdrawal Method</Label>
                <Select value={withdrawalMethod} onValueChange={setWithdrawalMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank-1234">Bank Account ****1234</SelectItem>
                    <SelectItem value="paypal">PayPal account</SelectItem>
                    <SelectItem value="digital-wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium text-yellow-800">Processing Time</p>
                  <p className="text-gray-600">Withdrawals typically process within 1-3 business days</p>
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={withdrawMutation.isPending}
                className="w-full gradient-primary text-white font-semibold hover:opacity-90"
              >
                <ArrowUp className="mr-2" size={16} />
                {withdrawMutation.isPending ? "Processing..." : "Request Withdrawal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary */}
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions?.map((transaction) => {
                  const { label, icon: Icon, color } = formatTransactionType(transaction.type);
                  return (
                    <tr key={transaction.id}>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                          <Icon size={12} className="mr-1" />
                          {label}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-mono">
                        ${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        {formatTransactionStatus(transaction.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
