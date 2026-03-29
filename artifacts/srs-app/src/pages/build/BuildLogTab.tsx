import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const buildLogEntries = [
  {
    date: "March 22",
    title: "The Vision",
    tldr: "Defining the bridge between curriculum design and spaced retrieval.",
    highlight: null,
    tags: ["Idea", "Concept"],
  },
  {
    date: "March 25",
    title: "The Claude Convergence",
    tldr: "Prompting Claude 4.6 to handle the complex retrieval math.",
    highlight: "The math got heavy, fast.",
    tags: ["Logic", "Python"],
  },
  {
    date: "March 28",
    title: "UI > Math?",
    tldr: "Realizing that if it doesn't look like an arcade, kids won't use it. Focusing on Neo-Brutalism.",
    highlight: null,
    tags: ["UI/UX", "Design"],
  },
];

const tagColors: Record<string, string> = {
  "Idea": "bg-blue-100 text-blue-800",
  "Concept": "bg-indigo-100 text-indigo-800",
  "Logic": "bg-purple-100 text-purple-800",
  "Python": "bg-yellow-100 text-yellow-800",
  "UI/UX": "bg-pink-100 text-pink-800",
  "Design": "bg-red-100 text-red-800",
};

export default function BuildLogTab() {
  return (
    <div className="space-y-8">
      {buildLogEntries.map((entry, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                    {entry.date}
                  </p>
                  <h3 className="text-2xl font-bold text-foreground mt-2">
                    {entry.title}
                  </h3>
                </div>
              </div>

              <p className="text-base text-muted-foreground mb-4">
                {entry.tldr}
              </p>

              {entry.highlight && (
                <div className="bg-amber-50 border-l-4 border-l-amber-500 p-4 mb-4">
                  <p className="italic text-amber-900">
                    "{entry.highlight}"
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className={`${tagColors[tag] || "bg-gray-100 text-gray-800"} text-xs font-medium`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
