"use client";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { SearchBar } from "@/components/search-bar";

import { fetchVolumes, removeVolume } from "@/lib/api";

type Volume = {
  Name: string;
  Driver: string;
  Mountpoint: string;
  CreatedAt?: string;
  UsageData?: { RefCount: number };
};

function truncateName(name: string, maxLength = 30) {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + "...";
}

function formatDate(dateString: string | undefined) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getUsageBadge(refCount: number) {
  return refCount > 0 ? (
    <Badge className="bg-green-50 text-green-700 border-green-200 text-sm">
      In Use
    </Badge>
  ) : (
    <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-sm">
      Unused
    </Badge>
  );
}

function VolumesTable({ searchTerm }: { searchTerm: string }) {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingName, setActionLoadingName] = useState<string | null>(
    null
  );

  const loadVolumes = async () => {
    setLoading(true);
    try {
      const data = await fetchVolumes();
      setVolumes(data);
    } catch (err) {
      console.error("Failed to fetch volumes:", err);
      alert("Failed to fetch volumes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVolumes();
  }, []);

  const handleRemove = async (name: string) => {
    if (!confirm(`Are you sure want to remove volume "${name}"?`)) return;
    setActionLoadingName(name);
    try {
      await removeVolume(name);
      alert("Volume removed successfully");
      loadVolumes();
    } catch (err: any) {
      alert(err.message || "Failed to remove volume");
    } finally {
      setActionLoadingName(null);
    }
  };

  const filteredVolumes = volumes.filter(
    (v) =>
      v.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.Driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 text-lg">
          Volumes ({filteredVolumes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Volume Name
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Driver
                  </TableHead>
                  <TableHead className="text-gray-600 text-base max-w-xs whitespace-nowrap truncate">
                    Mountpoint
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Created At
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVolumes.map((volume) => {
                  const refCount = volume.UsageData?.RefCount ?? 0;
                  const inUse = refCount > 0;
                  return (
                    <TableRow
                      key={volume.Name}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="font-medium text-gray-800 text-base whitespace-nowrap">
                        {truncateName(volume.Name)}
                      </TableCell>
                      <TableCell className="text-gray-600 text-base whitespace-nowrap">
                        {volume.Driver}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600 max-w-xs truncate">
                        {volume.Mountpoint}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getUsageBadge(refCount)}
                      </TableCell>
                      <TableCell className="text-gray-500 text-base whitespace-nowrap">
                        {formatDate(volume.CreatedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm"
                          onClick={() => handleRemove(volume.Name)}
                          disabled={inUse || actionLoadingName === volume.Name}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {actionLoadingName === volume.Name
                            ? "Removing..."
                            : "Remove"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VolumesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Volumes" />
        <main className="flex-1 p-6 space-y-6">
          <SearchBar
            placeholder="Search volumes by name or driver..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <VolumesTable searchTerm={searchTerm} />
        </main>
      </div>
    </SidebarInset>
  );
}
