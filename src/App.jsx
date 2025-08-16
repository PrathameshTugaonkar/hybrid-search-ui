import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, ChevronDown, AlertTriangle } from "lucide-react";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/search?query=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error(`Backend error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col items-center px-4 py-10">
      {/* Title */}
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold tracking-tight mb-6 text-center"
      >
        🌿 Smart INCI Search
      </motion.h1>

      {/* Search Box */}
      <div className="w-full max-w-lg flex items-center bg-slate-700 rounded-2xl overflow-hidden shadow-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-grow px-4 py-3 bg-transparent outline-none text-lg"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 transition"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Search className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-2 bg-red-600/20 text-red-300 px-4 py-3 rounded-lg max-w-lg"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>LIMIT REACHED:{error}</span>
        </motion.div>
      )}

      {/* Results */}
      <div className="w-full max-w-2xl mt-10 space-y-4">
        {results.length === 0 && !loading && !error && (
          <p className="text-slate-400 text-center">
            Type a query and hit search to see results.
          </p>
        )}

        {results.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-slate-800 rounded-xl shadow-md p-5 hover:shadow-xl transition"
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleExpand(item.source_id)}
            >
              <h2 className="text-lg font-semibold text-emerald-300">
                {item.incinamefull}
              </h2>
              <ChevronDown
                className={`w-5 h-5 transform transition ${
                  expanded[item.source_id] ? "rotate-180" : ""
                }`}
              />
            </div>

            {expanded[item.source_id] && (
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p>
                  <span className="font-medium text-white">Source ID:</span>{" "}
                  {item.source_id}
                </p>
                <p>
                  <span className="font-medium text-white">Functions:</span>{" "}
                  {item.functions?.join(", ")}
                </p>
                <div className="flex gap-4 text-xs text-slate-400 mt-2">
                  <span>🔤 Text Score: {item.textScore || 0}</span>
                  <span>📐 Vector Score: {item.vectorScore || 0}</span>
                  <span>⭐ Combined: {item.combinedScore?.toFixed(3) || 0}</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
