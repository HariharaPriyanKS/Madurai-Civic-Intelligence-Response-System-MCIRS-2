"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ShieldAlert, UserX, Building, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NegligenceAlertsProps {
  alerts: {
    worstWard: string;
    worstDept: string;
    worstWorker: string;
    worstContractor: string;
  };
}

export function NegligenceAlerts({ alerts }: NegligenceAlertsProps) {
  const alertCards = [
    { 
      label: "Highest SLA Breach Ward", 
      value: alerts.worstWard, 
      icon: Building, 
      sub: "Immediate review recommended",
      color: "border-red-500 bg-red-50 text-red-700"
    },
    { 
      label: "Critical Delay Department", 
      value: alerts.worstDept, 
      icon: ShieldAlert, 
      sub: "Longest average resolution time",
      color: "border-red-500 bg-red-50 text-red-700"
    },
    { 
      label: "Worker Performance Flag", 
      value: alerts.worstWorker, 
      icon: UserX, 
      sub: "Highest reopen rate detected",
      color: "border-orange-500 bg-orange-50 text-orange-700"
    },
    { 
      label: "Contractor Reliability Risk", 
      value: alerts.worstContractor, 
      icon: Truck, 
      sub: "Systemic overdue pattern",
      color: "border-orange-500 bg-orange-50 text-orange-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {alertCards.map((alert, i) => (
        <Card key={i} className={`border-2 shadow-xl ${alert.color}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-widest">{alert.label}</CardTitle>
              <alert.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-bold mb-1">{alert.value}</h3>
            <p className="text-[10px] font-medium opacity-80">{alert.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
