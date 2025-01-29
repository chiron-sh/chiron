"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const {
    data: session,
    isPending, //loading state
    error, //error object
  } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.reload();
  };

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex items-center space-x-2">
        {session?.user ? (
          <>
            <Link href="/dashboard">
              <Button variant={"ghost"}>Dashboard</Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant={"ghost"}>Settings</Button>
            </Link>
            <Button variant={"outline"} onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant={"outline"}>Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
