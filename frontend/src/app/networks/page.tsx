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

import { fetchNetworks, removeNetwork } from "@/lib/api";

type Network = {
  Id: string;
  Name: string;
  Driver: string;
  Scope: string;
  Internal: boolean;
  EnableIPv6: boolean;
  IPAM: any;
  Containers?: Record<string, any>;
  Options?: Record<string, any>;
  Labels?: Record<string, any>;
};

function NetworksTable({ searchTerm }: { searchTerm: string }) {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadNetworks = async () => {
    setLoading(true);
    try {
      const data = await fetchNetworks();
      setNetworks(data);
    } catch (err) {
      console.error(err);
      alert("Error loading networks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworks();
  }, []);

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case "local":
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
            Local
          </Badge>
        );
      case "swarm":
        return (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-sm">
            Swarm
          </Badge>
        );
      case "global":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 text-sm">
            Global
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-sm">
            {scope}
          </Badge>
        );
    }
  };

  const isDefaultNetwork = (network: Network) => {
    return (
      network.Labels?.["com.docker.network.bridge.default_bridge"] === "true" ||
      network.Name === "bridge" ||
      network.Name === "host" ||
      network.Name === "none"
    );
  };

  const getTypeBadge = (isDefault: boolean) => {
    return isDefault ? (
      <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-sm">
        Default
      </Badge>
    ) : (
      <Badge className="bg-green-50 text-green-700 border-green-200 text-sm">
        Custom
      </Badge>
    );
  };

  const handleRemove = async (networkId: string, networkName: string) => {
    if (!confirm(`Are you sure want to remove network "${networkName}"?`))
      return;

    setRemovingId(networkId);

    try {
      await removeNetwork(networkId);
      alert(`Network "${networkName}" removed`);
      loadNetworks();
    } catch (err: any) {
      alert(err.message || "Error removing network");
    } finally {
      setRemovingId(null);
    }
  };

  const filteredNetworks = networks.filter(
    (network) =>
      network.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      network.Driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 text-lg">
          Networks ({filteredNetworks.length})
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
                    Network ID
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Name
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Driver
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Scope
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Type
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNetworks.map((network) => {
                  const defaultNetwork = isDefaultNetwork(network);
                  return (
                    <TableRow
                      key={network.Id}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <TableCell className="font-mono text-sm text-gray-600 whitespace-nowrap">
                        {network.Id.slice(0, 12)}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800 text-base whitespace-nowrap">
                        {network.Name}
                      </TableCell>
                      <TableCell className="text-gray-600 text-base whitespace-nowrap">
                        {network.Driver}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getScopeBadge(network.Scope)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getTypeBadge(defaultNetwork)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {!defaultNetwork && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm"
                            onClick={() =>
                              handleRemove(network.Id, network.Name)
                            }
                            disabled={removingId === network.Id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {removingId === network.Id
                              ? "Removing..."
                              : "Remove"}
                          </Button>
                        )}
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

export default function NetworksPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Networks" />
        <main className="flex-1 p-6 space-y-6">
          <SearchBar
            placeholder="Search networks by name or driver..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <NetworksTable searchTerm={searchTerm} />
        </main>
      </div>
    </SidebarInset>
  );
}
