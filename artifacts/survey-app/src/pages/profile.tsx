import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Wallet, Smartphone, User as UserIcon, Coins, ArrowRight } from "lucide-react";
import { useWithdrawPoints, getGetUserQueryKey, getGetUserCompletionsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const { user, updatePoints } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Redirect if not logged in
  if (!user) {
    setLocation("/login");
    return null;
  }

  const withdrawMutation = useWithdrawPoints({
    mutation: {
      onSuccess: (data) => {
        setIsWithdrawing(true);
        // Simulate a delay for M-Pesa processing
        setTimeout(() => {
          updatePoints(data.points);
          queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(user.userId) });
          queryClient.invalidateQueries({ queryKey: getGetUserCompletionsQueryKey(user.userId) });
          setIsWithdrawing(false);
          toast({ 
            title: "Withdrawal Successful", 
            description: `KES ${data.message} simulated M-Pesa transaction complete.`,
          });
        }, 1500);
      },
      onError: (error: any) => {
        toast({ title: "Withdrawal failed", description: error.message || "Failed to withdraw points", variant: "destructive" });
      }
    }
  });

  const handleWithdraw = () => {
    if (user.points < 100) {
      toast({ title: "Insufficient points", description: "You need at least 100 points to withdraw.", variant: "destructive" });
      return;
    }
    withdrawMutation.mutate({ id: user.userId });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p className="text-lg font-semibold">{user.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground/80 flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{user.points}</div>
              <p className="text-primary-foreground/70 mt-1">Available Points</p>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="secondary" 
                className="w-full font-semibold mt-4" 
                onClick={handleWithdraw}
                disabled={user.points < 100 || withdrawMutation.isPending || isWithdrawing}
              >
                {withdrawMutation.isPending || isWithdrawing ? (
                  "Processing..."
                ) : (
                  <>
                    Withdraw to M-Pesa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {user.points < 100 && (
          <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3 border border-dashed">
            <Wallet className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">Minimum Withdrawal</h4>
              <p className="text-sm text-muted-foreground">You need at least 100 points to withdraw to M-Pesa. Complete more surveys to earn points.</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
