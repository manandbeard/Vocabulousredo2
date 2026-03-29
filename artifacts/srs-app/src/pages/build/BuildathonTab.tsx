import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

const buildathonData = {
  event: "Agent 4 Buildathon",
  admin: "Nathan Helland",
  progress: [
    { milestone: "Project Inception", status: "completed", percentage: 100 },
    { milestone: "Database Schema & API", status: "completed", percentage: 100 },
    { milestone: "Core UI & Layout", status: "completed", percentage: 100 },
    { milestone: "Spaced Repetition Engine", status: "completed", percentage: 100 },
    { milestone: "Analytics & Insights", status: "completed", percentage: 100 },
    { milestone: "Neo-Brutalism Theme", status: "completed", percentage: 100 },
    { milestone: "Public Launch", status: "in-progress", percentage: 75 },
  ],
};

export default function BuildathonTab() {
  const completedMilestones = buildathonData.progress.filter(m => m.status === "completed").length;
  const totalMilestones = buildathonData.progress.length;
  const overallProgress = (completedMilestones / totalMilestones) * 100;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-amber-600" />
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {buildathonData.event}
            </h2>
            <p className="text-muted-foreground">
              Facilitated by {buildathonData.admin}
            </p>
          </div>
        </div>

        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-foreground">Overall Progress</span>
                  <span className="text-sm font-bold text-amber-700">
                    {Math.round(overallProgress)}%
                  </span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
              <p className="text-sm text-muted-foreground">
                {completedMilestones} of {totalMilestones} milestones completed
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-4">
        {buildathonData.progress.map((milestone, index) => (
          <motion.div
            key={milestone.milestone}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={milestone.status === "completed" ? "border-green-200 bg-green-50/30" : "border-blue-200 bg-blue-50/30"}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      {milestone.milestone}
                    </h3>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      milestone.status === "completed" 
                        ? "text-green-700 bg-green-100 px-3 py-1 rounded" 
                        : "text-blue-700 bg-blue-100 px-3 py-1 rounded"
                    }`}>
                      {milestone.status === "completed" ? "✓ Done" : "In Progress"}
                    </span>
                  </div>
                  <Progress value={milestone.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
