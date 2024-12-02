import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import axios from "axios";
import { ReactElement } from "react";

export async function ProtectedDashboard({
  children,
}: Readonly<{ children: React.ReactNode }>): Promise<React.AwaitedReactNode> {
  const authCookie = cookies().has("Authorization");
  if (!authCookie) {
    redirect("/login");
  }
  const { data } = await axios.get("http://localhost:3000/apis/retirement", {
    headers: { Cookie: cookies().toString() },
  });
  if (!data) {
    return redirect("/onboarding");
  }

  return children as ReactElement;
}