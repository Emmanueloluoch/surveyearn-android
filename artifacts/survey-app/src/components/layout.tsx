import { ReactNode } from "react";
import { Link } from "wouter";
import { Layers } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Layers className="h-5 w-5" />
              </div>
              <span className="font-semibold text-lg tracking-tight">SurveyTool</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
