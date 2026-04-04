import { useLocation } from "wouter";
import { User as UserIcon, Phone, Coins, LogOut, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Layout } from "@/components/layout";
import { Link } from "wouter";

export default function Account() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <Layout>
        <div className="px-4 pt-4 space-y-4">
          <p className="text-xl font-extrabold" style={{ color: "#004d00" }}>Account</p>
          <div className="rounded-2xl p-6 text-center" style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}>
            <UserIcon className="h-12 w-12 mx-auto mb-3" style={{ color: "#b3ffb3" }} />
            <p className="font-bold" style={{ color: "#004d00" }}>Not signed in</p>
            <p className="text-sm mt-1 mb-4" style={{ color: "#666" }}>Sign in to manage your account</p>
            <div className="flex gap-2">
              <Link href="/login" className="flex-1">
                <button className="w-full py-2.5 rounded-xl font-bold text-sm border-2" style={{ borderColor: "#00b33c", color: "#00b33c" }}>
                  Login
                </button>
              </Link>
              <Link href="/signup" className="flex-1">
                <button className="w-full py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: "#00b33c" }}>
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const menuItems = [
    { icon: Coins, label: "Your Balance", value: `${user.points.toLocaleString()} KSh`, href: "/wallet" },
    { icon: Phone, label: "Phone Number", value: user.phone, href: null },
    { icon: ShieldCheck, label: "Account Status", value: "Active", href: null },
  ];

  return (
    <Layout>
      <div className="px-4 pt-4 pb-6 space-y-4">
        <p className="text-xl font-extrabold" style={{ color: "#004d00" }}>Account</p>

        {/* Profile card */}
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "#004d00" }}>
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center text-xl font-extrabold shrink-0"
            style={{ background: "#00b33c", color: "#fff" }}
          >
            {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-extrabold text-white">{user.name}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{user.phone}</p>
            <div className="mt-1 inline-flex items-center gap-1 bg-green-600/30 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
              <span className="text-xs font-semibold text-green-300">Active Member</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Balance", val: `${user.points} KSh` },
            { label: "Min Withdraw", val: "100 KSh" },
            { label: "M-Pesa", val: "Ready" },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-2xl p-3 text-center" style={{ background: "#fff", border: "1.5px solid #e0f5e0" }}>
              <p className="text-sm font-extrabold" style={{ color: "#004d00" }}>{val}</p>
              <p className="text-xs mt-0.5" style={{ color: "#888" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Menu items */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #e0f5e0" }}>
          {menuItems.map(({ icon: Icon, label, value, href }, i) => (
            <div key={label}>
              {i > 0 && <div style={{ height: 1, background: "#e0f5e0" }} />}
              <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: "#fff" }}>
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#e5f7e0" }}>
                  <Icon className="h-4 w-4" style={{ color: "#00b33c" }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: "#888" }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: "#004d00" }}>{value}</p>
                </div>
                {href && <ChevronRight className="h-4 w-4" style={{ color: "#ccc" }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: "#fff", border: "1.5px solid #fecaca", color: "#dc2626" }}
          onClick={() => { logout(); setLocation("/login"); }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </Layout>
  );
}
