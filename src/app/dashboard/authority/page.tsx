"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { calculateDisplayStatus } from "@/lib/issue-logic";
import { AlertTriangle, TrendingUp, ShieldAlert, BarChart3, FileText } from "lucide-react";

// Mock system-wide oversight data
const RISK_ISSUES = [
  {
    id: "MDU-1103",
    ward: "Ward 12",
    officer: "Rajesh K.",
    reopenCount: 3,
    status: "InProgress",
    slaBreached: true
  },
  {
    id: "MDU-4422",
    ward: "Ward 45",
    officer: "Senthamizh M.",
    reopenCount: 4,
    status: "Reopened",
    slaBreached: false
  }
];

export default function AuthorityDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary">Governance Risk Control</h1>
            <p className="text-muted-foreground">Madurai Commissioner & Collector Oversight Portal.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl h-12 gap-2">
              <FileText className="h-4 w-4" /> Export Audit Log
            </Button>
            <Button className="rounded-xl h-12 gap-2">
              <BarChart3 className="h-4 w-4" /> Analytics Report
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-none shadow-md bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-red-600 uppercase">Integrity Risks</h3/CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-red-700">14</span>
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-orange-600 uppercase">SLA Breaches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-orange-700">42</span>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Compliance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">92.4%</span>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Evidence Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">100%</span>
                <Badge className="bg-green-100 text-green-700">Mandatory</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle>Governance Risk Analytics</CardTitle>
            <CardDescription>High-frequency reopens and systematic SLA failures.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Ward</TableHead>
                  <TableHead>Assigned Officer</TableHead>
                  <TableHead>Reopens</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Risk Factor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RISK_ISSUES.map(issue => (
                  <TableRow key={issue.id} className="hover:bg-red-50/30">
                    <TableCell className="font-bold">{issue.id}</TableCell>
                    <TableCell>{issue.ward}</TableCell>
                    <TableCell>{issue.officer}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {issue.reopenCount} Times
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={calculateDisplayStatus({
                        internalStatus: issue.status,
                        isSlaBreached: issue.slaBreached,
                        reopenCount: issue.reopenCount,
                        hasProof: false,
                        isProofVerified: false
                      })} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="bg-red-900 text-white">High Alert</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Button({ children, className, variant, ...props }: any) {
  const base = "px-4 py-2 font-bold transition-all disabled:opacity-50";
  const variants: any = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-input hover:bg-muted"
  };
  return <button className={`${base} ${variants[variant || 'default']} ${className}`} {...props}>{children}</button>;
}
