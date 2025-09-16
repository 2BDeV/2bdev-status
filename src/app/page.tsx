"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

type SiteStatus = { name: string; online: boolean };
type OverrideStatus = { [key: string]: "online" | "maintenance" | "offline" };

export default function HomePage() {
  const [override, setOverride] = useState<OverrideStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
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

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-300">Státusz betöltése...</p>;

  const offlineSites = Object.entries(override).filter(([, status]) => status === "offline");
  const maintenanceSites = Object.entries(override).filter(([, status]) => status === "maintenance");

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center">
      {offlineSites.length > 0 && (
        <div className="bg-red-700 text-white p-5 mb-4 rounded-lg shadow-lg w-full max-w-2xl flex items-start gap-3">
          <AlertTriangle size={28} />
          <div>
            <strong>Figyelem!</strong> A következő oldal(ak) teljesen offline:
            <ul className="list-disc list-inside ml-5 mt-1">
              {offlineSites.map(([name]) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {maintenanceSites.length > 0 && (
        <div className="bg-yellow-500 text-gray-900 p-5 mb-6 rounded-lg shadow-lg w-full max-w-2xl flex items-start gap-3">
          <AlertTriangle size={28} />
          <div>
            <strong>Figyelem!</strong> A következő oldal(ak) karbantartás alatt áll:
            <ul className="list-disc list-inside ml-5 mt-1">
              {maintenanceSites.map(([name]) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-6 text-center">Oldal státuszok</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {Object.entries(override).map(([name, status]) => {
          let statusText = status === "online" ? "Elérhető" : status === "maintenance" ? "Karbantartás alatt" : "Offline";
          const colorClass = status === "online" ? "text-green-400" : status === "maintenance" ? "text-yellow-400" : "text-red-600";
          const icon = status === "online" ? <CheckCircle size={20} className="inline mr-2" /> : <AlertTriangle size={20} className="inline mr-2" />;

          return (
            <div key={name} className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center gap-3 hover:shadow-xl transition">
              {icon}
              <span className={`${colorClass} font-semibold`}>
                {name}: {statusText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
