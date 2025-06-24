import { Calendar } from "lucide-react";

interface PageHeaderProps {
  title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1 text-base">
            <Calendar className="h-5 w-5" />
            {currentDate}
          </p>
        </div>
      </div>
    </header>
  );
}
