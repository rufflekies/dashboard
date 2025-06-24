"use client";
import { useState, useEffect } from "react";
import { Play, RotateCcw, Square, Trash2 } from "lucide-react";

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

import { fetchContainers, containerAction } from "@/lib/api";

type Container = {
  Id: string;
  Names: string[];
  State: string;
  Status: string;
  Image: string;
  Created: number;
};

function ContainersTable({ searchTerm }: { searchTerm: string }) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadContainers = async () => {
    setLoading(true);
    try {
      const data = await fetchContainers();
      setContainers(data);
    } catch (err) {
      console.error("Failed to fetch containers:", err);
      alert("Failed to load containers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 text-sm">
            Running
          </Badge>
        );
      case "exited":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 text-sm">
            Exited
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
            Paused
          </Badge>
        );
      case "created":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-sm">
            Created
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-sm">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (epochSeconds: number) =>
    new Date(epochSeconds * 1000).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleAction = async (action: string, containerId: string) => {
    setActionLoadingId(containerId);
    try {
      const container = containers.find((c) => c.Id === containerId);
      if (!container) throw new Error("Container not found");

      const containerName = container.Names[0].replace("/", "");

      await containerAction(action, containerName);

      alert(`SUCCESS: ${action.toUpperCase()} container ${containerName}`);

      loadContainers();
    } catch (err: any) {
      alert(`FAILED to ${action} container: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredContainers = containers.filter(
    (container) =>
      container.Names.some((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      ) || container.Image.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 text-lg">
          Containers ({filteredContainers.length})
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
                    Container ID
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Name
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Image
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
                {filteredContainers.map((container) => (
                  <TableRow
                    key={container.Id}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="font-mono text-sm text-gray-600 whitespace-nowrap">
                      {container.Id.substring(0, 12)}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800 text-base whitespace-nowrap">
                      {container.Names[0].replace("/", "")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(container.State)}
                    </TableCell>
                    <TableCell className="text-gray-600 text-base">
                      {container.Image}
                    </TableCell>
                    <TableCell className="text-gray-500 text-base whitespace-nowrap">
                      {formatDate(container.Created)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {container.State === "running" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm"
                            onClick={() => handleAction("stop", container.Id)}
                            disabled={actionLoadingId === container.Id}
                          >
                            <Square className="h-4 w-4 mr-1" />
                            {actionLoadingId === container.Id
                              ? "Processing..."
                              : "Stop"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 text-sm"
                            onClick={() => handleAction("start", container.Id)}
                            disabled={actionLoadingId === container.Id}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            {actionLoadingId === container.Id
                              ? "Processing..."
                              : "Start"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-sm"
                          onClick={() => handleAction("restart", container.Id)}
                          disabled={actionLoadingId === container.Id}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {actionLoadingId === container.Id
                            ? "Processing..."
                            : "Restart"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure want to remove container "${container.Id.slice(
                                  0,
                                  12
                                )}"?`
                              )
                            ) {
                              handleAction("remove", container.Id);
                            }
                          }}
                          disabled={actionLoadingId === container.Id}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {actionLoadingId === container.Id
                            ? "Processing..."
                            : "Remove"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContainersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Containers" />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <SearchBar
              placeholder="Search containers by name or image..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <ContainersTable searchTerm={searchTerm} />
        </main>
      </div>
    </SidebarInset>
  );
}
