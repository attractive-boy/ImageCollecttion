/* eslint-disable @next/next/no-async-client-component */
// app/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const AuthDataDisplay = ({ data }: { data: any }) => (
  <div>
    <h1>Microsoft OAuth Login</h1>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>
);

export default function Home() {
  const searchParams = useSearchParams();
  const authCode = searchParams.get("code");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!authCode) {
        setLoading(false);
        return;
      }

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

      const result = await response.json();
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [authCode]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No auth code provided.</div>;
  }

  return (
    <Suspense fallback={<div>Loading data...</div>}>
      <AuthDataDisplay data={data} />
    </Suspense>
  );
}
