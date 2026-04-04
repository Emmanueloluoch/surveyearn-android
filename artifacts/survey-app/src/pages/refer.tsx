import { useState } from "react";
import { Copy, Check, Users, Gift, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { Link } from "wouter";

function generateCode(userId: number, name: string) {
  const prefix = name.slice(0, 2).toUpperCase();
  const num = (userId * 7 + 1337) % 9999;
  return `${prefix}${num.toString().padStart(4, "0")}`;
}

export default function Refer() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [codeApplied, setCodeApplied] = useState(false);

  const refCode = user ? generateCode(user.userId, user.name) : "------";

  const handleCopy = () => {
    navigator.clipboard.writeText(refCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCode = () => {
    if (friendCode.trim().length < 4) return;
    setCodeApplied(true);
  };

  if (!user) {
    return (
      <Layout>
        <div className="px-4 pt-4 space-y-4">
          <p className="text-xl font-extrabold" style={{ color: "#004d00" }}>Referral Program</p>
          <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}>
            <Users className="h-12 w-12 mx-auto mb-3" style={{ color: "#b3ffb3" }} />
            <p className="font-bold" style={{ color: "#004d00" }}>Sign in to refer friends</p>
            <p className="text-sm mt-1 mb-4" style={{ color: "#666" }}>Earn bonus KSh for every friend who joins</p>
            <Link href="/signup">
              <button className="w-full py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: "#00b33c" }}>
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <p className="text-xl font-extrabold" style={{ color: "#004d00" }}>Referral Program</p>

        {/* Hero */}
        <div className="rounded-2xl p-5 text-center" style={{ background: "#004d00" }}>
          <Gift className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
          <p className="text-white font-bold">Invite friends, earn together!</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Share your code. When your friend completes their first survey, you both earn bonus KSh.
          </p>
        </div>

        {/* Daily progress */}
        <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}>
          <p className="text-sm font-bold mb-3" style={{ color: "#004d00" }}>Daily Progress</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Surveys Done", val: "0" },
              { label: "Referrals", val: "0" },
              { label: "Completion", val: "0%" },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xl font-extrabold" style={{ color: "#004d00" }}>{val}</p>
                <p className="text-xs" style={{ color: "#888" }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-full h-2 overflow-hidden" style={{ background: "#e5f7e0" }}>
            <div className="h-full rounded-full" style={{ width: "0%", background: "#00b33c" }} />
          </div>
        </div>

        {/* Your referral code */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}>
          <p className="text-sm font-bold" style={{ color: "#004d00" }}>Your Referral Code</p>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "#e5f7e0" }}>
            <span className="flex-1 text-xl font-extrabold tracking-widest" style={{ color: "#004d00", letterSpacing: "0.2em" }}>
              {refCode}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg text-white transition-all"
              style={{ background: copied ? "#009933" : "#00b33c" }}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Enter friend's code */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}>
          <p className="text-sm font-bold" style={{ color: "#004d00" }}>Enter Friend's Code</p>
          <input
            value={friendCode}
            onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
            placeholder="e.g. JD0042"
            maxLength={8}
            className="w-full px-4 py-3 rounded-xl text-sm font-bold outline-none tracking-widest"
            style={{ background: "#e5f7e0", color: "#004d00", border: "1.5px solid #b3ffb3" }}
          />
          <button
            className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50"
            style={{ background: "#00b33c" }}
            disabled={friendCode.trim().length < 4 || codeApplied}
            onClick={handleApplyCode}
          >
            {codeApplied ? "✓ Code Applied!" : "Apply Code"}
          </button>
        </div>

        {/* Your referrals */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: "#004d00" }}>Your Referrals (0)</p>
          <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", border: "1.5px dashed #b3ffb3" }}>
            <Users className="h-8 w-8 mx-auto mb-2" style={{ color: "#b3ffb3" }} />
            <p className="text-sm font-medium" style={{ color: "#004d00" }}>No referrals yet</p>
            <p className="text-xs mt-1" style={{ color: "#888" }}>Share your code to start earning referral bonuses.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
