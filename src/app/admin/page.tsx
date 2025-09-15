"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

type OverrideStatus = {
  [key: string]: "online" | "maintenance" | "offline";
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [override, setOverride] = useState<OverrideStatus>({});
  const [loading, setLoading] = useState(true);

  // ✅ useEffect a komponens tetején, nem feltételesen
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/login");
      return;
    }

    async function fetchOverride() {
      try {
        const res = await fetch("/api/status/override");
        const data: OverrideStatus = await res.json();
        setOverride(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOverride();
  }, [session, status]);

  if (loading || status === "loading") return <p>Betöltés...</p>;

  async function updateStatus(siteName: string, newStatus: "online" | "maintenance" | "offline") {
    const updated = { ...override, [siteName]: newStatus };
    setOverride(updated);

    await fetch("/api/status/override", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  }

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-gray-100">
      <h1 className="text-3xl font-bold mb-4">Admin panel</h1>
      <p className="mb-6">Üdv, {session.user?.name}!</p>

      <div className="bg-gray-800 p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">Oldalak státusza</h2>
        {Object.entries(override).map(([name, status]) => (
          <div key={name} className="flex items-center justify-between mb-3 p-3 bg-gray-700 rounded">
            <span className="font-semibold">{name}</span>
            <div className="flex gap-2">
              {["online", "maintenance", "offline"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(name, s as "online" | "maintenance" | "offline")}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    status === s
                      ? s === "online"
                        ? "bg-green-500 text-white"
                        : s === "maintenance"
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-red-600 text-white"
                      : "bg-gray-600 text-gray-200 hover:bg-gray-500"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-6 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Kijelentkezés
      </button>
    </div>
  );
}
