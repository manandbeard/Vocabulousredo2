import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChangelogEntry {
  id: number;
  taskNumber: number;
  title: string;
  status: "pending" | "in-progress" | "shipped";
  whatAndWhy: string;
  doneLooksLike: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  shipped: "bg-green-100 text-green-800",
};

export default function ChangeLogTab() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        const response = await fetch("/api/changelog");
        if (!response.ok) throw new Error("Failed to fetch changelog");
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, []);

  if (loading) {
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

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Error loading changelog: {error}</p>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No changelog entries yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Task #{entry.taskNumber}: {entry.title}
                  </h3>
                </div>
                <Badge className={`${statusColors[entry.status]} text-xs font-medium capitalize`}>
                  {entry.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    What & Why
                  </h4>
                  <p className="text-foreground">{entry.whatAndWhy}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Done Looks Like
                  </h4>
                  <p className="text-foreground">{entry.doneLooksLike}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                {new Date(entry.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
