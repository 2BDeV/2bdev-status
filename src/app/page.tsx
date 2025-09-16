"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

type SiteStatus = {
  name: string;
  online: boolean;
};

type OverrideStatus = {
  [key: string]: "online" | "maintenance" | "offline";
};

export default function HomePage() {
  const [statusList, setStatusList] = useState<SiteStatus[]>([]);
  const [override, setOverride] = useState<OverrideStatus>({});
  const [loading, setLoading] = useState(true);

  // Lekérjük az aktuális státuszokat a backendből
  useEffect(() => {
    async function fetchStatus() {
      try {
        // Itt feltételezzük, hogy a backend mindig a Redis-ből adja az adatot
        const res = await fetch("/api/status/override");
        const data: OverrideStatus = await res.json();

        // Átalakítjuk tömbbé a vizualizációhoz
        const list: SiteStatus[] = Object.entries(data).map(([name, status]) => ({
          name,
          online: status === "online",
        }));

        setStatusList(list);
        setOverride(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // 15 mp
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-300">
        Státusz betöltése...
      </p>
    );

  // Offline és maintenance oldalak
  const offlineSites = statusList.filter(
    (site) => override[site.name] === "offline"
  );
  const maintenanceSites = statusList.filter(
    (site) => override[site.name] === "maintenance"
  );

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center">
      {/* 🔴 Offline banner */}
      {offlineSites.length > 0 && (
        <div className="bg-red-700 text-white p-5 mb-4 rounded-lg shadow-lg w-full max-w-2xl flex items-start gap-3">
          <AlertTriangle size={28} />
          <div>
            <strong>Figyelem!</strong> A következő oldal(ak) teljesen offline:
            <ul className="list-disc list-inside ml-5 mt-1">
              {offlineSites.map((site) => (
                <li key={site.name}>{site.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 🟡 Karbantartás banner */}
      {maintenanceSites.length > 0 && (
        <div className="bg-yellow-500 text-gray-900 p-5 mb-6 rounded-lg shadow-lg w-full max-w-2xl flex items-start gap-3">
          <AlertTriangle size={28} />
          <div>
            <strong>Figyelem!</strong> A következő oldal(ak) karbantartás alatt áll:
            <ul className="list-disc list-inside ml-5 mt-1">
              {maintenanceSites.map((site) => (
                <li key={site.name}>{site.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-6 text-center">
        Oldal státuszok
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {statusList.map((site) => {
          const siteOverride = override[site.name] || "online";

          let statusText = "Elérhető";
          if (siteOverride === "maintenance") statusText = "Karbantartás alatt";
          if (siteOverride === "offline") statusText = "Offline";

          const colorClass =
            siteOverride === "online"
              ? "text-green-400"
              : siteOverride === "maintenance"
              ? "text-yellow-400"
              : "text-red-600";

          const icon =
            siteOverride === "online" ? (
              <CheckCircle size={20} className="inline mr-2" />
            ) : (
              <AlertTriangle size={20} className="inline mr-2" />
            );

          return (
            <div
              key={site.name}
              className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-3 hover:shadow-xl transition"
            >
              {icon}
              <span className={`${colorClass} font-semibold`}>
                {site.name}: {statusText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
