import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Zap, Target, LineChart } from "lucide-react";

export default function SplitScreenDock() {
  return (
    <div className="min-h-screen bg-white font-['Inter'] text-slate-900 flex flex-col md:flex-row selection:bg-purple-100 selection:text-purple-900">
      
      {/* LEFT PANEL - FIXED DOCK */}
      <div className="w-full md:w-[38%] md:fixed md:top-0 md:h-screen md:border-r border-slate-100 bg-slate-50/50 p-8 md:p-12 lg:p-16 flex flex-col justify-between overflow-y-auto">
        
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900">Vocabulous²</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
              Make learning <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">stick</span>, not slip away.
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-md">
              Vocabulous uses science‑backed spaced retrieval and adaptive review to help users actually remember what they learn across content.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-auto">
          <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800 rounded-full h-12 px-8">
            Start Learning <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100 rounded-full h-12 px-8">
            Learn More
          </Button>
        </div>
      </div>

      {/* RIGHT PANEL - SCROLLABLE CONTENT */}
      <div className="w-full md:w-[62%] md:ml-[38%] bg-white">
        
        {/* STATS STRIP */}
        <div className="border-b border-slate-100 py-12 px-8 md:px-16 lg:px-24 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">87%</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Retention</div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">94%</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Engagement</div>
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">&lt;200ms</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Latency</div>
            </div>
          </div>
        </div>

        {/* BENEFITS SECTION */}
        <div className="py-20 px-8 md:px-16 lg:px-24 max-w-4xl">
          <div className="space-y-24">
            
            {/* Benefit 01 */}
            <div className="group relative flex flex-col md:flex-row gap-8 items-start">
              <div className="text-7xl font-light text-slate-200 group-hover:text-blue-600 transition-colors duration-500 shrink-0 leading-none">
                01
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Built on real learning science</h3>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Leveraging decades of cognitive psychology research, our platform automatically spaces reviews at optimal intervals to ensure long-term memory retention rather than short-term cramming.
                </p>
              </div>
            </div>

            {/* Benefit 02 */}
            <div className="group relative flex flex-col md:flex-row gap-8 items-start">
              <div className="text-7xl font-light text-slate-200 group-hover:text-purple-600 transition-colors duration-500 shrink-0 leading-none">
                02
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Short, powerful practice</h3>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Bite-sized microlearning sessions are designed to fit into busy schedules. Just 5 minutes a day builds a compounding knowledge base that lasts a lifetime.
                </p>
              </div>
            </div>

            {/* Benefit 03 */}
            <div className="group relative flex flex-col md:flex-row gap-8 items-start">
              <div className="text-7xl font-light text-slate-200 group-hover:text-blue-600 transition-colors duration-500 shrink-0 leading-none">
                03
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Adaptive for every learner</h3>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  The algorithm learns what you struggle with and what you've mastered, dynamically adjusting your learning path to optimize time spent on difficult concepts.
                </p>
              </div>
            </div>

            {/* Benefit 04 */}
            <div className="group relative flex flex-col md:flex-row gap-8 items-start">
              <div className="text-7xl font-light text-slate-200 group-hover:text-purple-600 transition-colors duration-500 shrink-0 leading-none">
                04
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Actionable insight for teachers</h3>
                </div>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Educators get real-time dashboards showing class-wide knowledge gaps and individual student progress, allowing for data-driven interventions.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER PADDING */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}
