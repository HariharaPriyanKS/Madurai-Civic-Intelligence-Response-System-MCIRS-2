"use client";

import { Badge } from "@/components/ui/badge";
import { PriorityImpact, getPriorityStyles } from "@/lib/priority-logic";
import { cn } from "@/lib/utils";
import { Flame, AlertCircle, Info } from "lucide-react";

interface PriorityBadgeProps {
  impact: PriorityImpact;
  score: number;
  className?: string;
}

export function PriorityBadge({ impact, score, className }: PriorityBadgeProps) {
  const Icon = impact === 'Critical' ? AlertCircle : impact === 'High Impact' ? Flame : Info;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant="outline" 
        className={cn("font-bold px-3 py-1 rounded-full border shadow-sm flex items-center gap-1", getPriorityStyles(impact))}
      >
        <Icon className="h-3 w-3" />
        {impact}
      </Badge>
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
        Score: {score}
      </span>
    </div>
  );
}
