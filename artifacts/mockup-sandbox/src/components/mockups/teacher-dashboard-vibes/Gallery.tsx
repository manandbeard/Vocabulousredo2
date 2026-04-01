import React, { useState } from "react";
import WarmApproachable from "./WarmApproachable";
import FormalProfessional from "./FormalProfessional";
import PlayfulVibrant from "./PlayfulVibrant";
import ModeratePlayful from "./ModeratePlayful";
import DenseAnalytics from "./DenseAnalytics";
import RelationalNetwork from "./RelationalNetwork";
import CommandCenter from "./CommandCenter";

const variations = [
  { name: "Warm & Approachable", component: WarmApproachable, desc: "Earthy, nurturing, inviting" },
  { name: "Formal & Professional", component: FormalProfessional, desc: "Executive, refined, trustworthy" },
  { name: "Playful & Vibrant", component: PlayfulVibrant, desc: "Energetic, youth-forward, modern" },
  { name: "Moderate Playful", component: ModeratePlayful, desc: "Fun & approachable, but refined" },
  { name: "Dense Analytics", component: DenseAnalytics, desc: "Information-heavy, comparison-focused" },
  { name: "Relational Network", component: RelationalNetwork, desc: "Spatial scatter plot, data relationships" },
  { name: "Command Center", component: CommandCenter, desc: "Mission control, alert-driven, zoned" }
];

export default function Gallery() {
  const [selected, setSelected] = useState(0);
  const SelectedComponent = variations[selected].component;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Teacher Dashboard Variations</h1>
          <div className="flex overflow-x-auto gap-3 pb-2">
            {variations.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                  i === selected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-2">{variations[selected].desc}</p>
        </div>
      </div>

      {/* Viewport */}
      <div className="pt-32 pb-8 px-4">
        <div className="max-w-full mx-auto border border-slate-300 rounded-lg overflow-hidden shadow-lg bg-white">
          <SelectedComponent />
        </div>
      </div>

      {/* Metadata footer */}
      <div className="max-w-7xl mx-auto px-6 py-8 text-slate-600 text-xs">
        <p>Viewing: <strong>{variations[selected].name}</strong> — First 3 explore emotional tones; Last 3 explore information architecture</p>
      </div>
    </div>
  );
}
