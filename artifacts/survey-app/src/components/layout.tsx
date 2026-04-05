import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, ListChecks, Wallet, User as UserIcon, Users, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const NAV_ITEMS = [
  { href: "/",        icon: Home,        label: "Home"    },
  { href: "/surveys", icon: ListChecks,  label: "Surveys" },
  { href: "/wallet",  icon: Wallet,      label: "Wallet"  },
  { href: "/account", icon: UserIcon,    label: "Account" },
  { href: "/refer",   icon: Users,       label: "Refer"   },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#e5f7e0" }}>

      {/* ── Top header ── */}
      <header style={{ background: "#004d00" }} className="sticky top-0 z-50 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user ? (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: "#00b33c", color: "#fff" }}
              >
                {initials(user.name)}
              </div>
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#00b33c" }}
              >
                <UserIcon className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                {user ? "Welcome back," : "SurveyEarn"}
              </p>
              <p className="text-sm font-bold text-white leading-tight">
                {user ? user.name : "Sign in to earn"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Balance</p>
                  <p className="text-base font-extrabold text-white">{user.points.toLocaleString()} KSh</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                  title="Log out"
                >
                  <LogOut className="h-4 w-4 text-white" />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <button
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/40 text-white"
                  >
                    Login
                  </button>
                </Link>
                <Link href="/signup">
                  <button
                    className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                    style={{ background: "#00b33c" }}
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* ── Bottom tab bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center"
        style={{ background: "#004d00", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link key={href} href={href} className="flex-1">
              <button
                className="flex flex-col items-center justify-center w-full py-2 gap-0.5 transition-opacity"
                style={{ opacity: active ? 1 : 0.55 }}
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center"
                  style={{ background: active ? "#00b33c" : "transparent" }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-white" style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>
                  {label}
                </span>
              </button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
