"use client";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectIt } from "@/context";
export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className={`bg-transparent text-white py-2 px-6 md:px-10 ${
        pathname === "/" || pathname === "/about" ? "fixed" : ""
      } z-50 w-screen backdrop-blur-md h-[10vh]`}
    >
      <div className="container mx-auto flex items-center justify-between ">
        {/* Mobile Menu */}
        <div className="flex items-center gap-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="h-10 w-10" variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-[#1a1a1a]">
              <nav className="flex flex-col items-start gap-4 p-4 *:dark:text-white">
                <Link
                  href="/"
                  className={`text-sm font-medium hover:text-[#00d8ff] transition-colors ${
                    pathname === "/" ? "text-[#00d8ff]" : ""
                  }`}
                  prefetch={false}
                >
                  Home
                </Link>
                <Link
                  href="/startups"
                  className={`text-sm font-medium hover:text-[#00d8ff] transition-colors ${
                    pathname.startsWith("/startups") ? "text-[#00d8ff]" : ""
                  }`}
                  prefetch={false}
                >
                  Startups
                </Link>
                <Link
                  href="/loans"
                  className={`text-sm font-medium hover:text-[#00d8ff] transition-colors ${
                    pathname.startsWith("/loans") ? "text-[#00d8ff]" : ""
                  }`}
                  prefetch={false}
                >
                  Loans
                </Link>
                <Link
                  href="/about"
                  className={`text-sm font-medium hover:text-[#00d8ff] transition-colors ${
                    pathname === "/about" ? "text-[#00d8ff]" : ""
                  }`}
                  prefetch={false}
                >
                  About
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <span className="text-xl font-bold">
            Ventur<span className="text-[#00d8ff]">â</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className={`text-sm font-medium hover:text-[#00d8ff] transition-colors ${
              pathname === "/" ? "text-[#00d8ff]" : ""
            }`}
            prefetch={false}
          >
            Home
          </Link>
          <Link
            href="/startups"
            className={`text-sm font-medium hover:text-[#00d8ff] transition-colors ${
              pathname.startsWith("/startups") ? "text-[#00d8ff]" : ""
            }`}
            prefetch={false}
          >
            Startups
          </Link>
          <Link
            href="/loans"
            className={`text-sm font-medium hover:text-[#00d8ff] transition-colors ${
              pathname.startsWith("/loans") ? "text-[#00d8ff]" : ""
            }`}
            prefetch={false}
          >
            Loans
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium hover:text-[#00d8ff] transition-colors ${
              pathname === "/about" ? "text-[#00d8ff]" : ""
            }`}
            prefetch={false}
          >
            About
          </Link>
        </nav>
        <ConnectIt />
      </div>
    </header>
  );
}

function MenuIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
