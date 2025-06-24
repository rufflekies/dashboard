"use client";

import {
  Activity,
  Box,
  Database,
  Play,
  RotateCcw,
  Square,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

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
import { StatCard } from "@/components/stat-card";

import {
  fetchContainers,
  containerAction,
  fetchImages,
  fetchVolumes,
} from "@/lib/api";

function ContainerTable() {
  const [containers, setContainers] = useState<any[]>([]);
  const [loadingContainer, setLoadingContainer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadContainers = async () => {
    setLoading(true);
    try {
      const data = await fetchContainers();
      setContainers(data);
    } catch (err) {
      console.error("Fetch containers failed:", err);
      alert("Failed to fetch containers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContainers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
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
      default:
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-sm">
            {status}
          </Badge>
        );
    }
  };

  const handleAction = async (action: string, containerName: string) => {
    if (!containerName) return;
    try {
      setLoadingContainer(containerName);
      await containerAction(action, containerName);
      alert(`${action.toUpperCase()} SUCCESS: ${containerName}`);
      loadContainers();
    } catch (err: any) {
      alert(`FAILED to ${action} container: ${err.message || err}`);
    } finally {
      setLoadingContainer(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent>
          <div className="p-4 text-center text-gray-600">
            Loading containers...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 text-lg">
          Recent Containers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200 hover:bg-gray-50">
                <TableHead className="text-gray-600 text-base whitespace-nowrap">
                  Container Name
                </TableHead>
                <TableHead className="text-gray-600 text-base whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-gray-600 text-base whitespace-nowrap">
                  Image
                </TableHead>
                <TableHead className="text-gray-600 text-base whitespace-nowrap">
                  Created
                </TableHead>
                <TableHead className="text-gray-600 text-base whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {containers.map((container) => {
                const containerName = container.Names?.[0] || "";
                return (
                  <TableRow
                    key={container.Id}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="font-medium text-gray-800 text-base whitespace-nowrap">
                      {containerName.replace("/", "")}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getStatusBadge(container.State)}
                    </TableCell>
                    <TableCell className="text-gray-600 text-base">
                      {container.Image}
                    </TableCell>
                    <TableCell className="text-gray-500 text-base whitespace-nowrap">
                      {dayjs.unix(container.Created).fromNow()}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {container.State === "running" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm"
                            onClick={() => handleAction("stop", containerName)}
                            disabled={loadingContainer === containerName}
                          >
                            {loadingContainer === containerName ? (
                              <>Processing...</>
                            ) : (
                              <>
                                <Square className="h-4 w-4 mr-1" />
                                Stop
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 text-sm"
                            onClick={() => handleAction("start", containerName)}
                            disabled={loadingContainer === containerName}
                          >
                            {loadingContainer === containerName ? (
                              <>Processing...</>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-sm"
                          onClick={() => handleAction("restart", containerName)}
                          disabled={loadingContainer === containerName}
                        >
                          {loadingContainer === containerName ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restart
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure want to remove container "${containerName}"?`
                              )
                            ) {
                              handleAction("remove", containerName);
                            }
                          }}
                          disabled={loadingContainer === containerName}
                        >
                          {loadingContainer === containerName ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [containers, setContainers] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [volumes, setVolumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cont, imgs, vols] = await Promise.all([
        fetchContainers(),
        fetchImages(),
        fetchVolumes(),
      ]);
      setContainers(cont);
      setImages(imgs);
      setVolumes(vols);
    } catch (err) {
      console.error("Fetch all data failed:", err);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const runningCount = containers.filter((c) => c.State === "running").length;
  const stoppedCount = containers.filter((c) => c.State === "exited").length;
  const imagesCount = images.length;
  const volumesCount = volumes.length;

  const stats = [
    {
      title: "Running Containers",
      value: runningCount.toString(),
      icon: Activity,
      gradient: "from-green-500/20 to-green-600/20",
      iconColor: "text-green-500",
    },
    {
      title: "Stopped Containers",
      value: stoppedCount.toString(),
      icon: Square,
      gradient: "from-red-500/20 to-red-600/20",
      iconColor: "text-red-500",
    },
    {
      title: "Total Images",
      value: imagesCount.toString(),
      icon: Box,
      gradient: "from-blue-500/20 to-blue-600/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Total Volumes",
      value: volumesCount.toString(),
      icon: Database,
      gradient: "from-purple-500/20 to-purple-600/20",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Docker Dashboard" />
        <main className="flex-1 p-6 space-y-6">
          {loading ? (
            <div className="p-4 text-center text-gray-600">
              Loading dashboard...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <StatCard key={stat.title} {...stat} />
                ))}
              </div>
              <ContainerTable />
            </>
          )}
        </main>
      </div>
    </SidebarInset>
  );
}
