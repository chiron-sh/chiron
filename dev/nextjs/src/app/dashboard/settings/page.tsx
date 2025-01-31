import { auth } from "@/lib/auth";
import { chiron } from "@/lib/chiron";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  // const profile = await chiron.api.getProfile({
  //   headers: await headers(),
  // });

  const profile = await chiron.api.getProfile({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/login");
  }

  return (
    <div>
      Settings
      <br /> {JSON.stringify(profile)}
    </div>
  );
}
