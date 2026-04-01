import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import WarmApproachable from "./WarmApproachable";
import FormalProfessional from "./FormalProfessional";
import PlayfulVibrant from "./PlayfulVibrant";
import ModeratePlayful from "./ModeratePlayful";
import DenseAnalytics from "./DenseAnalytics";
import RelationalNetwork from "./RelationalNetwork";
import CommandCenter from "./CommandCenter";
import ClarityFirst from "./ClarityFirst";
import InteractionFirst from "./InteractionFirst";
import AccessibilityFirst from "./AccessibilityFirst";
import MobileHamburgerMenu from "../mobile-menu-solutions/MobileHamburgerMenu";
import MobileScrollableTabs from "../mobile-menu-solutions/MobileScrollableTabs";
import MobileStackedTabs from "../mobile-menu-solutions/MobileStackedTabs";
import ComparisonView from "../mobile-menu-solutions/ComparisonView";
import CardFlipVariations from "../card-flip-animations/CardFlipVariations";

const variations = [
  { category: "Card Flip Animations", items: [
    { name: "Flip Variations", component: CardFlipVariations, desc: "8 different card flip animation styles to choose from" },
  ] },
  { category: "Mobile Menu Solutions", items: [
    { name: "Comparison View", component: ComparisonView, desc: "All 3 solutions side-by-side with pros/cons" },
    { name: "Hamburger Menu", component: MobileHamburgerMenu, desc: "Drawer navigation with menu icon toggle" },
    { name: "Scrollable Tabs", component: MobileScrollableTabs, desc: "Horizontal scroll with tab icons" },
    { name: "Stacked Tabs", component: MobileStackedTabs, desc: "Full-width vertical tab buttons" },
  ] },
  { category: "Emotional Tones", items: [
    { name: "Warm & Approachable", component: WarmApproachable, desc: "Earthy, nurturing, inviting" },
    { name: "Formal & Professional", component: FormalProfessional, desc: "Executive, refined, trustworthy" },
    { name: "Playful & Vibrant", component: PlayfulVibrant, desc: "Energetic, youth-forward, modern" },
    { name: "Moderate Playful", component: ModeratePlayful, desc: "Fun & approachable, but refined" },
  ] },
  { category: "Information Architecture", items: [
    { name: "Dense Analytics", component: DenseAnalytics, desc: "Information-heavy, comparison-focused" },
    { name: "Relational Network", component: RelationalNetwork, desc: "Spatial scatter plot, data relationships" },
    { name: "Command Center", component: CommandCenter, desc: "Mission control, alert-driven, zoned" },
  ] },
  { category: "Usability Focus", items: [
    { name: "Clarity First", component: ClarityFirst, desc: "Visual hierarchy dominates; simplifies to essentials" },
    { name: "Interaction First", component: InteractionFirst, desc: "Clear affordances; obvious clickability everywhere" },
    { name: "Accessibility First", component: AccessibilityFirst, desc: "High contrast, large text, semantic structure" },
  ] }
];

const allVariations = variations.flatMap(cat => cat.items);

export default function Gallery() {
  const [selected, setSelected] = useState(0);
  const [menuOpen, setMenuOpen] = useState(true);
  const SelectedComponent = allVariations[selected].component;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard Variations</h1>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
              aria-label={menuOpen ? "Hide menu" : "Show menu"}
            >
              {menuOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
          </div>

          {menuOpen && (
            <>
              <div className="space-y-2">
                {variations.map((category, catIdx) => (
                  <div key={catIdx}>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{category.category}</div>
                    <div className="flex overflow-x-auto gap-2 pb-2">
                      {category.items.map((v, itemIdx) => {
                        const globalIdx = variations.slice(0, catIdx).flatMap(c => c.items).length + itemIdx;
                        return (
                          <button
                            key={globalIdx}
                            onClick={() => setSelected(globalIdx)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                              globalIdx === selected
                                ? "bg-blue-600 text-white shadow-sm"
                                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                            }`}
                          >
                            {v.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-3">{allVariations[selected].desc}</p>
            </>
          )}
        </div>
      </div>

      {/* Viewport */}
      <div className={`${menuOpen ? "pt-40" : "pt-20"} pb-8 px-4 transition-all`}>
        <div className="max-w-full mx-auto border border-slate-300 rounded-lg overflow-hidden shadow-lg bg-white">
          <SelectedComponent />
        </div>
      </div>

      {/* Metadata footer */}
      <div className="max-w-7xl mx-auto px-6 py-8 text-slate-600 text-xs">
        <p>Viewing: <strong>{allVariations[selected].name}</strong> — {allVariations[selected].desc}</p>
      </div>
    </div>
  );
}
