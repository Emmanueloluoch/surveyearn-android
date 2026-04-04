import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useWithdrawPoints, getGetUserQueryKey, getGetUserCompletionsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";

const MIN_WITHDRAW = 100;

export default function Wallet() {
  const { user, updatePoints } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);

  const withdrawMutation = useWithdrawPoints({
    mutation: {
      onSuccess: (data) => {
        setProcessing(true);
        setTimeout(() => {
          updatePoints(data.points);
          queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(user!.userId) });
          queryClient.invalidateQueries({ queryKey: getGetUserCompletionsQueryKey(user!.userId) });
          setProcessing(false);
          toast({ title: "Withdrawal Initiated!", description: data.message });
        }, 1500);
      },
      onError: (err: any) => {
        toast({ title: "Withdrawal failed", description: err.message, variant: "destructive" });
      },
    },
  });

  const canWithdraw = user && user.points >= MIN_WITHDRAW;

  return (
    <Layout>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <p className="text-xl font-extrabold" style={{ color: "#004d00" }}>Withdraw Funds</p>

        {/* Balance card */}
        <div className="rounded-2xl p-5 text-center" style={{ background: "#004d00" }}>
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>Available Balance</p>
          <p className="text-4xl font-extrabold text-white mb-1">
            {(user?.points ?? 0).toLocaleString()} KSh
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>1 point = 1 KSh</p>
        </div>

        {/* Activation / min-balance notice */}
        {!canWithdraw && (
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "#fff8e1", border: "1.5px solid #ffe082" }}
          >
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
            <div>
              <p className="font-bold text-sm" style={{ color: "#92400e" }}>
                {user ? "Minimum Balance Required" : "Account Activation Required"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#78350f" }}>
                {user
                  ? `You need at least ${MIN_WITHDRAW} KSh to withdraw. Complete more surveys to earn.`
                  : "Sign in or create an account to start earning and withdrawing."}
              </p>
            </div>
          </div>
        )}

        {/* Withdraw form */}
        {user && (
          <div className="rounded-2xl p-4 space-y-4" style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "#004d00" }}>
                M-Pesa Number
              </label>
              <div
                className="w-full px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "#e5f7e0", color: "#004d00" }}
              >
                {user.phone}
              </div>
              <p className="text-xs mt-1" style={{ color: "#888" }}>Funds will be sent to this number</p>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: "#004d00" }}>
                Amount
              </label>
              <div
                className="w-full px-4 py-3 rounded-xl text-sm font-medium"
                style={{ background: "#e5f7e0", color: "#004d00" }}
              >
                {user.points.toLocaleString()} KSh (full balance)
              </div>
            </div>
            <button
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-50"
              style={{ background: canWithdraw ? "#00b33c" : "#999" }}
              disabled={!canWithdraw || withdrawMutation.isPending || processing}
              onClick={() => withdrawMutation.mutate({ id: user.userId })}
            >
              {withdrawMutation.isPending || processing
                ? "Processing via M-Pesa…"
                : canWithdraw
                ? `Withdraw ${user.points.toLocaleString()} KSh`
                : `Minimum ${MIN_WITHDRAW} KSh required`}
            </button>
          </div>
        )}

        {/* Recent withdrawals */}
        <div>
          <p className="font-bold text-sm mb-3" style={{ color: "#004d00" }}>Recent Withdrawals</p>
          <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ background: "#fff", border: "1.5px dashed #b3ffb3" }}
          >
            <Clock className="h-8 w-8 mb-2" style={{ color: "#b3ffb3" }} />
            <p className="text-sm font-medium" style={{ color: "#004d00" }}>No withdrawals yet</p>
            <p className="text-xs mt-1" style={{ color: "#888" }}>Your M-Pesa transactions will appear here.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
