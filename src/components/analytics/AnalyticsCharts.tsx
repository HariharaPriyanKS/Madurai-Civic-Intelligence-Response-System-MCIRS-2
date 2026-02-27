"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnalyticsData } from "@/lib/analytics-logic";
import { cn } from "@/lib/utils";

export function WardComplaintsChart({ 
  data, 
  highlightWardId,
  isPublic = false 
}: { 
  data: AnalyticsData['wardStats'], 
  highlightWardId?: string,
  isPublic?: boolean
}) {
  // Color logic based on descending rank
  const getBarColor = (index: number) => {
    if (index < 5) return "#ef4444"; // Top 5: Red
    if (index < 15) return "#f97316"; // Next 10: Orange
    return "#14b8a6"; // Remaining: Teal
  };

  return (
    <Card className="border-none shadow-xl col-span-full">
      <CardHeader className="bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Ward Performance Ranking</CardTitle>
            <CardDescription>
              {isPublic 
                ? "City-wide reporting distribution by ward. (Transparency View)" 
                : "Descending rank of complaint volume across all 100 wards."}
            </CardDescription>
          </div>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-tighter">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#ef4444] rounded-sm" /> High Risk</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#f97316] rounded-sm" /> Moderate</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#14b8a6] rounded-sm" /> Stable</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[600px] pr-4">
          <div className="h-[2500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                layout="vertical" 
                margin={{ left: 120, right: 40, top: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={110} 
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const isHighlighted = highlightWardId && payload.value.includes(highlightWardId);
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        dy={4} 
                        textAnchor="end" 
                        fill={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
                        className={cn("text-[10px] transition-colors", isHighlighted && "font-bold text-sm")}
                      >
                        {payload.value}
                      </text>
                    );
                  }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border-2 rounded-2xl shadow-2xl space-y-2 min-w-[200px]">
                          <p className="font-bold text-primary border-b pb-1">Ward {d.id}: {d.name}</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-medium">
                            <span className="text-muted-foreground">Total Reports:</span>
                            <span className="text-right font-bold">{d.total}</span>
                            
                            {!isPublic && (
                              <>
                                <span className="text-muted-foreground">Pending:</span>
                                <span className="text-right font-bold text-orange-600">{d.pending}</span>
                                
                                <span className="text-muted-foreground">Resolved:</span>
                                <span className="text-right font-bold text-green-600">{d.resolved}</span>
                                
                                <span className="text-muted-foreground">SLA Breach:</span>
                                <span className="text-right font-bold text-red-600">{d.slaBreachRate}%</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="total" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                  animationDuration={1500}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(index)} 
                      fillOpacity={highlightWardId && !entry.name.includes(highlightWardId) ? 0.6 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ScrollArea>
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
            <Bar dataKey="count" fill="#24D8D8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
