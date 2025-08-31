import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  ChevronDown,
  FileText,
  AlertTriangle,
  HeartPulse,
  Layers,
  FlaskConical
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [activeTab, setActiveTab] = useState("search"); // "search" | "agent"

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [expanded, setExpanded] = useState({});

  const [backendHealthy, setBackendHealthy] = useState(false);
  const [formulationName, setFormulationName] = useState("Anti-Aging Cream v1");
  const [ingredients, setIngredients] = useState(
    '{"Aqua": "40%", "Titanium Dioxide": "7%", "Methylparaben": "0.5%"}'
  );
  const [agentResults, setAgentResults] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/health`)
      .then((res) => res.json())
      .then((data) => setBackendHealthy(data.ok))
      .catch(() => setBackendHealthy(false));
  }, [BACKEND_URL]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    setSearchError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      setSearchError(err.message || "Something went wrong.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!ingredients.trim()) return;
    setAgentLoading(true);
    setAgentError(null);
    setAgentResults(null);

    try {
      const res = await fetch(`${BACKEND_URL}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formulationName,
          ingredients: JSON.parse(ingredients),
        }),
      });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const data = await res.json();
      setAgentResults(data);
    } catch (err) {
      setAgentError(err.message);
    } finally {
      setAgentLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4 py-10">

      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold tracking-tight mb-6 text-center"
      >
       🌿 Smart Search & Intelligence
      </motion.h1>

      <div className="flex justify-center gap-4 mb-10">
        <button
          onClick={() => setActiveTab("search")}
          className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === "search" ? "bg-emerald-600" : "bg-slate-700"
          }`}
        >
          <Layers className="w-5 h-5" /> INCI Search
        </button>
        <button
          onClick={() => setActiveTab("agent")}
          className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === "agent" ? "bg-emerald-600" : "bg-slate-700"
          }`}
        >
          <FlaskConical className="w-5 h-5" /> Regulatory Agent
        </button>
      </div>

      {/* --- INCI Search Tab --- */}
      {activeTab === "search" && (
        <div className="flex flex-col items-center">
          {/* Search Box */}
          <div className="w-full max-w-lg flex items-center bg-slate-700 rounded-2xl overflow-hidden shadow-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ingredients..."
              className="flex-grow px-4 py-3 bg-transparent outline-none text-lg"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 transition"
            >
              {searchLoading ? <Loader2 className="animate-spin" /> : <Search className="w-6 h-6" />}
            </button>
          </div>

          {/* Error */}
          {searchError && (
            <div className="mt-6 flex items-center gap-2 bg-red-600/20 text-red-300 px-4 py-3 rounded-lg max-w-lg">
              <AlertTriangle className="w-5 h-5" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Results */}
          <div className="w-full max-w-2xl mt-10 space-y-4">
            {searchResults.length === 0 && !searchLoading && !searchError && (
              <p className="text-slate-400 text-center">Type a query and hit search to see results.</p>
            )}

            {searchResults.map((item, idx) => (
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
                  <h2 className="text-lg font-semibold text-emerald-300">{item.incinamefull}</h2>
                  <ChevronDown
                    className={`w-5 h-5 transform transition ${
                      expanded[item.source_id] ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {expanded[item.source_id] && (
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <p>
                      <span className="font-medium text-white">Source ID:</span> {item.source_id}
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
      )}

      {/* --- Regulatory Agent Tab --- */}
      {activeTab === "agent" && (
        <div className="flex flex-col items-center">
          {/* Backend Health */}
          <div className="mb-6 flex items-center gap-2 text-sm">
            {backendHealthy ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <HeartPulse className="w-4 h-4 animate-pulse" /> Backend Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-4 h-4" /> Backend Unreachable
              </span>
            )}
          </div>

          {/* Input Form */}
          <div className="w-full max-w-2xl bg-slate-800 rounded-2xl shadow-lg p-6 space-y-4">
            <input
              type="text"
              value={formulationName}
              onChange={(e) => setFormulationName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white outline-none"
              placeholder="Formulation Name"
            />
            <textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full h-40 px-4 py-3 rounded-lg bg-slate-700 text-white outline-none"
              placeholder='{"Aqua": "40%", "Paraben": "0.5%"}'
            />
            <button
              onClick={handleValidate}
              disabled={agentLoading}
              className="w-full flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 transition px-4 py-3 rounded-lg font-semibold"
            >
                  {agentLoading && (
                    <motion.div
                      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FlaskConical className="w-12 h-12 text-emerald-400 animate-bounce" />

                        {/* Sequential Status Messages */}
                        <motion.p
                          className="mt-6 text-lg font-semibold text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6 }}
                        >
                          🔌 Connecting to Regulatory Agent…
                        </motion.p>

                        <motion.p
                          className="mt-2 text-slate-300 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2, duration: 0.6 }}
                        >
                          📡 Querying Ingredient Database…
                        </motion.p>

                        <motion.p
                          className="mt-2 text-slate-300 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2.4, duration: 0.6 }}
                        >
                          🧪 Running Compliance Checks…
                        </motion.p>

                        <motion.p
                          className="mt-2 text-slate-300 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 3.6, duration: 0.6 }}
                        >
                          ✅ Preparing Report…
                        </motion.p>
                      </motion.div>
                    </motion.div>
                  )}

              Validate Formulation
            </button>
          </div>

          {/* Error */}
          {agentError && (
            <div className="mt-6 flex items-center gap-2 bg-red-600/20 text-red-300 px-4 py-3 rounded-lg max-w-lg">
              <AlertTriangle className="w-5 h-5" />
              <span>{agentError}</span>
            </div>
          )}

          {/* Results */}
          {agentResults && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-3xl mt-10 bg-slate-800 rounded-xl shadow-lg p-6 space-y-4"
            >
              <h2 className="text-2xl font-bold text-emerald-300">Compliance Report - Downloadable</h2>

              {/* Ingredient Cards */}
              <div className="space-y-3">
                {agentResults.results.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      item.status.includes("✅") ? "bg-green-700/20" : "bg-red-700/20"
                    }`}
                  >
                    <h3 className="font-semibold text-white">
                      {item.ingredient} ({item.concentration})
                    </h3>
                    <p className="text-slate-300">{item.status}</p>
                  </motion.div>
                ))}
              </div>

              {/* Markdown Narrative */}
              {agentResults.summary && (
                <div className="prose prose-invert max-w-none whitespace-normal break-words mt-6">
                  <ReactMarkdown>{agentResults.summary}</ReactMarkdown>
                </div>
              )}

              {/* PDF Download */}
              {agentResults.pdf_url && (
                <a
                  href={`${BACKEND_URL}${agentResults.pdf_url}`}
                  className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="w-5 h-5" /> Download PDF Report
                </a>
              )}
              </motion.div>
            )}

        </div>
      )}
    </div>
  );
}
