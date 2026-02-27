"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AnalyticsData } from "@/lib/analytics-logic";

export function WardComplaintsChart({ data }: { data: AnalyticsData['wardStats'] }) {
  const topWards = data.slice(0, 20); // Show top 20 for readability

  return (
    <Card className="border-none shadow-lg col-span-2">
      <CardHeader>
        <CardTitle>Highest Complaint Wards</CardTitle>
        <CardDescription>Real-time volume distribution across Madurai (Top 20)</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topWards} layout="vertical" margin={{ left: 40, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              tick={{ fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-4 border rounded-xl shadow-2xl space-y-1">
                      <p className="font-bold text-primary">{d.name}</p>
                      <p className="text-xs">Total: {d.total}</p>
                      <p className="text-xs text-green-600">Resolved: {d.resolved}</p>
                      <p className="text-xs text-orange-600">Pending: {d.pending}</p>
                      <p className="text-xs text-red-600 font-bold">SLA Breached: {d.slaBreached}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {topWards.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index < 5 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StatusDistributionChart({ data }: { data: AnalyticsData['statusStats'] }) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Unresolved Issues Tracker</CardTitle>
        <CardDescription>Live pending status distribution</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AgeDistributionChart({ data }: { data: AnalyticsData['ageStats'] }) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Complaint Age Distribution</CardTitle>
        <CardDescription>Backlog severity and delay trends</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
