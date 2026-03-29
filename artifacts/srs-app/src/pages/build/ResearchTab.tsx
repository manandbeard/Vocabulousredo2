import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const leanCanvas = {
  problem: "Students struggle with knowledge retention due to cognitive load and spacing effect mismanagement. Traditional study methods rely on cramming, leading to rapid forgetting.",
  segments: "K-12 students, college students, language learners, professional educators, corporate training programs.",
  uvp: "Bring spaced retrieval science to the classroom. Turning passive memorization into an active, arcade-like learning game.",
  solution: "AI-powered spaced repetition scheduler with Neo-Brutalist UI/UX designed to feel like an arcade game, making learning engaging and sustainable.",
  channels: "Teacher-managed classrooms, direct student enrollment, integrations with existing LMS platforms, word-of-mouth.",
  revenue: "Freemium model: free for teachers, premium for students (detailed analytics, AI tutoring), B2B licensing for schools.",
  costs: "Cloud infrastructure (Replit Postgres), API hosting, team payroll, marketing, customer support.",
  metrics: "Student retention rate, daily active users, session duration, knowledge retention scores, teacher adoption rate, NPS score.",
  unfairAdvantage: "Deep integration of Curriculum Director expertise with AI-powered scheduling. Proprietary spaced repetition math. Early entry into underserved education tech niche.",
};

const canvasBlocks = [
  { title: "Problem", key: "problem", color: "bg-red-50 border-red-200" },
  { title: "Segments", key: "segments", color: "bg-orange-50 border-orange-200" },
  { title: "Unique Value Proposition", key: "uvp", color: "bg-yellow-50 border-yellow-200" },
  { title: "Solution", key: "solution", color: "bg-green-50 border-green-200" },
  { title: "Channels", key: "channels", color: "bg-blue-50 border-blue-200" },
  { title: "Revenue Streams", key: "revenue", color: "bg-indigo-50 border-indigo-200" },
  { title: "Cost Structure", key: "costs", color: "bg-purple-50 border-purple-200" },
  { title: "Key Metrics", key: "metrics", color: "bg-pink-50 border-pink-200" },
  { title: "Unfair Advantage", key: "unfairAdvantage", color: "bg-teal-50 border-teal-200" },
];

export default function ResearchTab() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-foreground mb-4">
          The Lean Canvas
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          A one-page business model describing Vocabulous' problem, solution, and market validation strategy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {canvasBlocks.map((block, index) => (
          <motion.div
            key={block.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`h-full border-2 ${block.color} hover:shadow-lg transition-shadow`}>
              <CardContent className="pt-6">
                <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">
                  {block.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {leanCanvas[block.key as keyof typeof leanCanvas]}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Why This Matters</h3>
            <p className="text-muted-foreground leading-relaxed">
              The education technology space is crowded with tools that optimize for engagement but ignore the science of learning.
              Vocabulous takes the opposite approach: we're grounded in cognitive psychology and spaced repetition research,
              but wrapped in a user experience that's genuinely fun to use. Our Lean Canvas is our North Star, keeping us aligned
              with our core mission: making learning stick.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
