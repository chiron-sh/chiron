import { auth } from "@/lib/auth";
import { chiron } from "@/lib/chiron";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  const profileReq = chiron.api.getProfile({
    headers: await headers(),
  });

  if (!(await session)?.user) {
    return redirect("/login");
  }

  const profile = await profileReq;

  return (
    <div>
      Settings
      <br /> {JSON.stringify(profile)}
    </div>
  );
}
