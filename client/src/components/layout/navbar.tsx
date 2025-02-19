import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Library, Home } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <span className="text-xl font-bold text-primary cursor-pointer">
                AI Prompt Builder
              </span>
            </Link>

            <div className="flex space-x-4">
              <Link href="/">
                <div
                  className={cn(
                    "flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer",
                    location === "/" && "text-primary"
                  )}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </div>
              </Link>
              <Link href="/templates">
                <div
                  className={cn(
                    "flex items-center space-x-2 hover:text-primary transition-colors cursor-pointer",
                    location === "/templates" && "text-primary"
                  )}
                >
                  <Library className="h-4 w-4" />
                  <span>Templates</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}