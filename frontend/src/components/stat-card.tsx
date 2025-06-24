import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  iconColor,
}: StatCardProps) {
  return (
    <Card className="bg-white border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
      </CardContent>
    </Card>
  );
}
