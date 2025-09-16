"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";

type SiteStatus = "online" | "maintenance" | "offline";

type Site = {
  name: string;
  url: string;
  status: SiteStatus;
};

export default function HomePage() {
  const [statusList, setStatusList] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/status");
        const data: Site[] = await res.json();
        setStatusList(data);
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

  const offlineSites = statusList.filter((site) => site.status === "offline");
  const maintenanceSites = statusList.filter((site) => site.status === "maintenance");

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center">
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

      <h1 className="text-4xl font-bold mb-6 text-center">Oldal státuszok</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {statusList.map((site) => {
          let statusText = "";
          let colorClass = "";
          let icon = null;

          switch (site.status) {
            case "online":
              statusText = "Elérhető";
              colorClass = "text-green-400";
              icon = <CheckCircle size={20} className="inline mr-2" />;
              break;
            case "maintenance":
              statusText = "Karbantartás alatt";
              colorClass = "text-yellow-400";
              icon = <AlertTriangle size={20} className="inline mr-2" />;
              break;
            case "offline":
              statusText = "Offline";
              colorClass = "text-red-600";
              icon = <AlertTriangle size={20} className="inline mr-2" />;
              break;
          }

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
