import { lazy, Suspense, useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Sparkles, GitCommit, Code2, Trophy, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const BuildLogTab = lazy(() => import("./build/BuildLogTab"));
const ChangeLogTab = lazy(() => import("./build/ChangeLogTab"));
const TechStackTab = lazy(() => import("./build/TechStackTab"));
const BuildathonTab = lazy(() => import("./build/BuildathonTab"));
const ResearchTab = lazy(() => import("./build/ResearchTab"));

type TabId = "build" | "changelog" | "tech" | "buildathon" | "research";

const tabs = [
  { id: "build" as TabId, label: "Build Log", icon: Sparkles },
  { id: "changelog" as TabId, label: "Change Log", icon: GitCommit },
  { id: "tech" as TabId, label: "Tech Stack", icon: Code2 },
  { id: "buildathon" as TabId, label: "Buildathon", icon: Trophy },
  { id: "research" as TabId, label: "Research", icon: BookOpen },
];

const tabComponents: Record<TabId, React.ComponentType> = {
  build: BuildLogTab,
  changelog: ChangeLogTab,
  tech: TechStackTab,
  buildathon: BuildathonTab,
  research: ResearchTab,
};

export default function BuildingInPublic() {
  const [activeTab, setActiveTab] = useState<TabId>("build");

  const TabComponent = tabComponents[activeTab];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="border-b border-border/60 bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            
            <div className="flex items-start gap-4 mb-4">
              <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                Agent 4 Buildathon
              </Badge>
            </div>

            <h1 className="text-5xl font-bold text-foreground mb-3 leading-tight">
              Building in Public
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A transparency repository for the judges and users of Vocabulous. Every step of our journey, laid bare.
            </p>
          </div>
        </div>

        {/* Sticky Tab Bar */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex overflow-x-auto gap-2 px-6 py-0 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap text-sm font-medium transition-all duration-200 border-b-2 ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Suspense fallback={<TabSkeleton />}>
            <TabComponent />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </Card>
      ))}
    </div>
  );
}
