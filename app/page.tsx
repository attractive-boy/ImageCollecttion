/* eslint-disable @next/next/no-async-client-component */
// app/page.tsx
"use client"
import { useSearchParams } from "next/navigation";
export default async function Home() {
  const searchParams = useSearchParams();
  const authCode = searchParams.get("code");
  if (!authCode) return null;
  const response = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: "08aa5d5c-fb91-4e84-a650-024effb790c5",
        code: authCode,
        redirect_uri: "http://localhost/",
        grant_type: "authorization_code",
        client_secret: "o-T8Q~uqnw0AQtbZrzXSMBXLz2.QkYTsF5SgOdyL",
      }),
    }
  );

  const data = await response.json();

  return (
    <div>
      <h1>Microsoft OAuth Login</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
