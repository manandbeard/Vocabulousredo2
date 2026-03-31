import { Link } from "wouter";

export default function Slide6() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-8">
      <div className="max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col items-center justify-center">
        <h2 className="text-6xl font-light text-slate-900 mb-12 tracking-wide">
          Enter The Lab
        </h2>

        <Link href="/">
          <button className="px-10 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-shadow mb-16">
            View the PoC
          </button>
        </Link>

        <div className="border-t border-slate-200 pt-12 max-w-lg">
          <p className="text-sm font-light text-slate-500 tracking-wide">
            Forge ahead with the Replit Agent. Week Two complete.
          </p>
        </div>
      </div>
    </div>
  );
}
