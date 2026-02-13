import React, { useState, useEffect } from "react";

// ==========================================
// 1. CONFIGURACIÓN Y DATOS (ESTÁTICOS)
// ==========================================

const uiTranslations = {
  es: {
    planFree: "Plan Free",
    planPremium: "Plan Premium ✨",
    placeholderFree: "Escribe tu idea simple...",
    placeholderPremium: "Describe tu visión viral...",
    btnKlic: "GENERAR CONTENIDO ⚡️",
    btnLoading: "CREANDO MAGIA...",
    limitReached: "LÍMITE ALCANZADO 🔒",
    copy: "COPIAR",
    copied: "LISTO",
    footerFree: "* El plan free permite 1 red social y 1 uso por sesión.",
    alertIdea: "Por favor escribe una idea.",
    alertPremium: "🔒 Esta red es solo para Premium.",
    labelTone: "Tono:",
    labelStyle: "✨ Tu Estilo (Premium):",
    labelVideoStyle: "🎬 Estilo de Video:",
    placeholderStyle: "Pega un post anterior. Imitaré tu voz...",
  },
  en: {
    planFree: "Free Plan",
    planPremium: "Premium Plan ✨",
    placeholderFree: "Write a simple idea...",
    placeholderPremium: "Describe your viral vision...",
    btnKlic: "GENERATE CONTENT ⚡️",
    btnLoading: "CREATING MAGIC...",
    limitReached: "LIMIT REACHED 🔒",
    copy: "COPY",
    copied: "DONE",
    footerFree: "* Free plan allows 1 social network and 1 use per session.",
    alertIdea: "Please write an idea.",
    alertPremium: "🔒 This network is Premium only.",
    labelTone: "Tone:",
    labelStyle: "✨ Your Style (Premium):",
    labelVideoStyle: "🎬 Video Style:",
    placeholderStyle: "Paste a previous post. I'll mimic your voice...",
  },
};

const languagesList = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
];

const tones = [
  { id: "professional", label: "👔 Profesional" },
  { id: "funny", label: "😂 Divertido" },
  { id: "sarcastic", label: "😏 Sarcástico" },
  { id: "empathetic", label: "❤️ Empático" },
  { id: "controversial", label: "🔥 Polémico" },
  { id: "educational", label: "📚 Educativo" },
  { id: "inspirational", label: "🚀 Inspirador" },
];

const platforms = [
  {
    id: "ig",
    name: "Instagram",
    icon: "📸",
    color: "text-pink-500",
    key: "instagram",
    premium: false,
  },
  {
    id: "tk",
    name: "TikTok",
    icon: "🎵",
    color: "text-cyan-400",
    key: "tiktok",
    premium: false,
  },
  {
    id: "li",
    name: "LinkedIn",
    icon: "💼",
    color: "text-blue-600",
    key: "linkedin",
    premium: true,
  },
  {
    id: "x",
    name: "X",
    icon: "🐦",
    color: "text-slate-300",
    key: "x",
    premium: true,
  },
  {
    id: "yt",
    name: "YouTube",
    icon: "▶️",
    color: "text-red-600",
    key: "youtube",
    premium: true,
  },
];

// ==========================================
// 2. COMPONENTE PRINCIPAL
// ==========================================

export default function App() {
  const [input, setInput] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [tone, setTone] = useState("professional");
  const [copiedId, setCopiedId] = useState(null);
  const [plan, setPlan] = useState("free");
  const [activePlatforms, setActivePlatforms] = useState(["ig"]);
  const [selectedLangCode, setSelectedLangCode] = useState("es");
  const [hasUsedFree, setHasUsedFree] = useState(false);

  const t = uiTranslations[selectedLangCode] || uiTranslations["en"];
  const selectedLangName =
    languagesList.find((l) => l.code === selectedLangCode)?.name || "English";

  useEffect(() => {
    const used = localStorage.getItem("klic_free_used");
    if (used && plan === "free") setHasUsedFree(true);
  }, [plan]);

  // FUNCIÓN PARA BUSCAR VIDEO EN PEXELS
  const fetchPexelsVideo = async (query) => {
    try {
      const pexelsKey =
        "luItioHo1TPcVYtrPlqUJe8RqIIVw3bJh0sbd24d0lDuYvQoCt7rplqa";
      const res = await fetch(
        `https://api.pexels.com/videos/search?query=${query}&per_page=1&orientation=portrait`,
        {
          headers: { Authorization: pexelsKey },
        }
      );
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        return (
          data.videos[0].video_files.find((v) => v.quality === "hd")?.link ||
          data.videos[0].video_files[0].link
        );
      }
      return null;
    } catch (e) {
      console.error("Error Pexels:", e);
      return null;
    }
  };

  const togglePlatform = (id) => {
    if (plan === "free") {
      const p = platforms.find((x) => x.id === id);
      if (p.premium) return alert(t.alertPremium);
      setActivePlatforms([id]);
    } else {
      if (activePlatforms.includes(id)) {
        setActivePlatforms(activePlatforms.filter((p) => p !== id));
      } else {
        setActivePlatforms([...activePlatforms, id]);
      }
    }
  };

  const handleKlic = async () => {
    if (plan === "free" && hasUsedFree) return;
    if (!input || activePlatforms.length === 0) return alert(t.alertIdea);

    setLoading(true);
    setResults(null);
    setVideoUrl(null);

    try {
      const apiKey = "AIzaSyDuvz09Lst3srQYpDMGIXyc3k5KDHZgIXU";
      const modelVersion = "gemini-2.0-flash-lite";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`;

      const promptRole =
        plan === "premium"
          ? "Eres un Growth Hacker de élite mundial. Tu objetivo es la viralidad."
          : "Eres un asistente de redacción útil y claro.";

      let styleInstruction = `Tono: ${
        tones.find((x) => x.id === tone)?.label
      }.`;
      if (plan === "premium" && customStyle.trim() !== "") {
        styleInstruction = `IMITE EL ESTILO: "${customStyle}"`;
      }

      // PROMPT MAESTRO QUE PIDE JSON PARA SEPARAR TEXTO Y BÚSQUEDA DE VIDEO
      const promptText = `
        ${promptRole}
        IDIOMA: ${selectedLangName}.
        IDEA: "${input}"
        ${styleInstruction}
        
        INSTRUCCIONES:
        1. Crea el contenido para estas redes: ${activePlatforms
          .map((id) => id)
          .join(", ")}.
        2. Proporciona una frase corta de búsqueda en INGLÉS para un video de fondo.
        
        RESPONDE SOLO CON ESTE FORMATO JSON:
        {
          "posts": { "ig": "texto", "tk": "texto"... },
          "videoSearch": "phrase in english"
        }
      `;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
      });

      const data = await response.json();
      const aiResponse = JSON.parse(
        data.candidates[0].content.parts[0].text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim()
      );

      // Mapear resultados
      const newResults = {};
      activePlatforms.forEach((id) => {
        const platformKey = platforms.find((p) => p.id === id).key;
        newResults[platformKey] =
          aiResponse.posts[id] ||
          aiResponse.posts[platformKey] ||
          "Error en generación";
      });
      setResults(newResults);

      // BUSCAR VIDEO REAL SI ES PREMIUM
      if (plan === "premium") {
        const video = await fetchPexelsVideo(aiResponse.videoSearch);
        setVideoUrl(video);
      }

      if (plan === "free") {
        setHasUsedFree(true);
        localStorage.setItem("klic_free_used", "true");
      }
    } catch (e) {
      console.error(e);
      alert("Error en la conexión. Revisa tus API Keys.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-all duration-700 ${
        plan === "premium" ? "bg-[#050505]" : "bg-[#020617]"
      } text-slate-200 font-sans p-6`}
    >
      <header className="text-center max-w-5xl mx-auto relative">
        <div className="flex justify-end mb-6">
          <select
            value={selectedLangCode}
            onChange={(e) => setSelectedLangCode(e.target.value)}
            className={`appearance-none cursor-pointer pl-4 pr-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
              plan === "premium"
                ? "bg-amber-900/20 border-amber-800 text-amber-500"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            {languagesList.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center items-center mb-10">
          <div
            className={`w-20 h-20 flex items-center justify-center rounded-3xl shadow-2xl transform hover:scale-105 transition-all ${
              plan === "premium"
                ? "bg-gradient-to-br from-amber-500 to-orange-700 rotate-3 shadow-orange-900/50"
                : "bg-gradient-to-br from-blue-600 to-indigo-800 shadow-blue-900/50"
            }`}
          >
            <span className="text-white font-black text-6xl italic tracking-tighter">
              K
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-1.5 rounded-3xl border border-slate-800 inline-flex shadow-inner mb-12">
          <button
            onClick={() => {
              setPlan("free");
              setActivePlatforms(["ig"]);
            }}
            className={`px-10 py-3 rounded-[1.2rem] text-xs font-black uppercase transition-all ${
              plan === "free"
                ? "bg-slate-800 text-white shadow-lg"
                : "text-slate-600"
            }`}
          >
            {t.planFree}
          </button>
          <button
            onClick={() => setPlan("premium")}
            className={`px-10 py-3 rounded-[1.2rem] text-xs font-black uppercase transition-all ${
              plan === "premium"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl"
                : "text-slate-600"
            }`}
          >
            {t.planPremium}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div
          className={`rounded-[3rem] p-10 border transition-all duration-500 ${
            plan === "premium"
              ? "bg-[#0f0f0f] border-amber-900/40 shadow-2xl shadow-amber-900/10"
              : "bg-[#0f172a] border-slate-800"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all border ${
                  activePlatforms.includes(p.id)
                    ? plan === "premium"
                      ? "border-amber-500 text-white shadow-amber-900/20"
                      : "border-blue-500 text-white shadow-blue-900/20"
                    : "border-slate-800 text-slate-500"
                }`}
              >
                <span
                  className={`text-xl ${
                    activePlatforms.includes(p.id)
                      ? p.color
                      : "grayscale opacity-50"
                  }`}
                >
                  {p.icon}
                </span>
                <span className="font-bold text-xs">{p.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-4">
                {t.labelTone}
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className={`w-full p-4 rounded-2xl font-bold text-sm border outline-none ${
                  plan === "premium"
                    ? "bg-amber-900/10 border-amber-900/30 text-amber-500"
                    : "bg-slate-900 border-slate-700 text-slate-300"
                }`}
              >
                {tones.map((to) => (
                  <option key={to.id} value={to.id}>
                    {to.label}
                  </option>
                ))}
              </select>
            </div>

            {plan === "premium" && (
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-amber-500 uppercase ml-4">
                  {t.labelStyle}
                </label>
                <input
                  type="text"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
                  placeholder={t.placeholderStyle}
                  className="w-full bg-amber-900/10 border border-amber-900/30 rounded-2xl p-4 text-sm text-white outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          <textarea
            className={`w-full bg-black/40 border border-slate-800 rounded-[2rem] p-8 text-xl outline-none h-40 resize-none text-white ${
              plan === "premium"
                ? "focus:border-amber-600"
                : "focus:border-blue-600"
            }`}
            placeholder={
              plan === "free" ? t.placeholderFree : t.placeholderPremium
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={handleKlic}
            disabled={loading || (plan === "free" && hasUsedFree)}
            className={`w-full mt-8 p-6 rounded-[1.8rem] font-black text-xl transition-all shadow-2xl uppercase ${
              loading ? "opacity-70" : ""
            } ${
              plan === "free" && hasUsedFree
                ? "bg-slate-800 text-slate-500"
                : plan === "premium"
                ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white"
                : "bg-gradient-to-r from-blue-700 to-indigo-600 text-white"
            }`}
          >
            {loading
              ? t.btnLoading
              : plan === "free" && hasUsedFree
              ? t.limitReached
              : t.btnKlic}
          </button>
        </div>

        {/* MUESTRA DE RESULTADOS ACTUALIZADA CON BOTONES DE ACCIÓN */}
        <div className="mt-12 space-y-10 pb-20">
          {platforms
            .filter((p) => activePlatforms.includes(p.id))
            .map((p) => (
              <div
                key={p.id}
                className={`rounded-[3rem] overflow-hidden border transition-all ${
                  plan === "premium"
                    ? "bg-[#0f0f0f] border-zinc-800"
                    : "bg-[#0f172a] border-slate-800"
                }`}
              >
                {/* Cabecera: Icono y Botón Copiar */}
                <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                    <span className={`text-2xl ${p.color}`}>{p.icon}</span>{" "}
                    {p.name}
                  </h3>
                  {results && results[p.key] && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(results[p.key]);
                        setCopiedId(p.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className={`text-[10px] font-black px-5 py-2 rounded-xl transition-all ${
                        copiedId === p.id
                          ? "bg-green-600 text-white"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {copiedId === p.id ? t.copied : t.copy}
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row min-h-[400px]">
                  {/* LADO IZQUIERDO: TEXTO Y BOTONES DE ACCIÓN */}
                  <div className="p-10 flex-1 flex flex-col justify-between">
                    <div
                      className={`text-xl leading-relaxed whitespace-pre-wrap font-medium ${
                        plan === "premium" ? "text-slate-100" : "text-slate-300"
                      }`}
                    >
                      {loading ? (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
                        </div>
                      ) : results ? (
                        results[p.key]
                      ) : (
                        "..."
                      )}
                    </div>

                    {/* BOTONES DE PUBLICACIÓN Y DESCARGA */}
                    {results && results[p.key] && (
                      <div className="mt-8 flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            const shareUrls = {
                              ig: "https://www.instagram.com/",
                              tk: "https://www.tiktok.com/upload",
                              li: "https://www.linkedin.com/sharing/share-offsite/",
                              x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                results[p.key]
                              )}`,
                            };
                            window.open(shareUrls[p.id] || "#", "_blank");
                          }}
                          className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg"
                        >
                          🚀 PUBLICAR EN {p.name}
                        </button>

                        {videoUrl && (
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-zinc-800 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-700 transition-all text-center"
                          >
                            📥 DESCARGAR MP4
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* LADO DERECHO: VIDEO PREVIEW */}
                  {plan === "premium" &&
                    videoUrl &&
                    (p.id === "tk" || p.id === "ig" || p.id === "yt") && (
                      <div className="w-full md:w-72 bg-black relative aspect-[9/16] shadow-2xl overflow-hidden">
                        <video
                          key={videoUrl}
                          src={videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-amber-500 text-black text-[8px] font-black px-2 py-1 rounded">
                          PREVIEW
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
