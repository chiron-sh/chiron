import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/login">
          <Button variant={"outline"}>Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button>Get Started</Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
