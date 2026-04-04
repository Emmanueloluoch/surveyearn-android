import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Layers, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Layers className="h-5 w-5" />
              </div>
              <span className="font-semibold text-lg tracking-tight">SurveyPesa KE</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold mr-1">
                    {user.points} pts
                  </span>
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden md:inline">{user.name}</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
