"use client";

import { Badge } from "@/components/ui/badge";
import { DisplayStatus, getStatusStyles, getStatusLabel } from "@/lib/issue-logic";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: DisplayStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn("font-semibold px-3 py-1 rounded-full border shadow-sm", getStatusStyles(status), className)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
