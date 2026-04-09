import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Code2, Database, Zap } from "lucide-react";

const techStack = [
  {
    icon: Code2,
    name: "Next.js / React",
    description: "Frontend framework for building responsive, interactive UI with server-side rendering capabilities.",
    color: "text-blue-600",
  },
  {
    icon: Zap,
    name: "Python Math Engine",
    description: "Scheduler API handling complex spaced repetition algorithms and memory retention calculations.",
    color: "text-yellow-600",
  },
  {
    icon: Database,
    name: "Replit Postgres",
    description: "Persistent memory store for user data, flashcards, and learning analytics.",
    color: "text-emerald-600",
  },
];

export default function TechStackTab() {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-foreground mb-4">
          The Agent-Assisted Founder
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Forged by Replit Agent, guided by a Curriculum Director. Building at the intersection of pedagogy and retention science.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {techStack.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-t-4 border-t-primary hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <Icon className={`h-12 w-12 ${tech.color} mb-4`} />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {tech.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {tech.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-2xl font-bold text-foreground mb-4">Architecture Philosophy</h3>
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-foreground leading-relaxed">
              Vocabulous is built on a separation of concerns: a sleek, interactive frontend handles the UI/UX experience,
              while a Python-powered scheduler engine manages the complex mathematics of spaced repetition. 
              The Replit Postgres database serves as our single source of truth, enabling real-time analytics and 
              personalized learning paths. Every component is designed to be observable, debuggable, and transparent.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
