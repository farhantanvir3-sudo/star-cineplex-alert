"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { BellRing, CalendarDays, Loader2, PlusCircle, Ticket } from "lucide-react";

type AlertRequest = {
  id: string;
  targetDate: string;
  isFulfilled: boolean;
  createdAt: string;
};

export default function Home() {
  const [alerts, setAlerts] = useState<AlertRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState("");

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) throw new Error("Failed to fetch alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (error) {
      toast.error("Failed to load active alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Please select a date.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: date }),
      });

      if (!res.ok) throw new Error("Failed to create alert");
      
      toast.success("Alert successfully set!");
      setDate("");
      fetchAlerts();
    } catch (error) {
      toast.error("Error setting alert.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center py-20 px-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black min-h-screen">
      <div className="max-w-2xl w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-full mb-2 ring-1 ring-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <Ticket className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
            Cineplex Ticket Alerts
          </h1>
          <p className="text-gray-400 text-lg">
            Monitor SKS Tower ticket drops automatically.
          </p>
        </div>

        {/* Add Alert Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-300 hover:border-gray-700">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <CalendarDays className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                className="w-full bg-gray-950 border border-gray-800 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-4 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Set Alert
                </>
              )}
            </button>
          </form>
        </div>

        {/* Active Alerts List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <BellRing className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-200">Active Alerts</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-gray-900/30 border border-gray-800/50 border-dashed rounded-2xl p-12 text-center">
              <p className="text-gray-500">No active alerts. Add one above to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group flex items-center justify-between bg-gray-900/40 border border-gray-800 rounded-xl p-5 hover:bg-gray-900/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                      <CalendarDays className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Target Date</p>
                      <p className="text-lg font-medium text-gray-200">
                        {format(new Date(alert.targetDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-gray-500 text-xs mb-1">Added On</p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
