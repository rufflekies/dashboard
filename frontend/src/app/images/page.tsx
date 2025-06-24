"use client";
import { useState, useEffect } from "react";
import { Trash2, Download } from "lucide-react";

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

import { fetchImages, pullImage, removeImage } from "@/lib/api";

type DockerImage = {
  Id: string;
  RepoTags: string[] | null;
  Size: number;
  Created: number;
};

function formatDate(epochSeconds: number) {
  return new Date(epochSeconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function ImagesTable({ searchTerm }: { searchTerm: string }) {
  const [images, setImages] = useState<DockerImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullImageName, setPullImageName] = useState("");

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await fetchImages();
      setImages(data);
    } catch (err) {
      console.error("Failed to fetch images:", err);
      alert("Failed to fetch images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm("Are you sure want to remove this image?")) return;
    setActionLoadingId(id);
    try {
      await removeImage(id);
      alert("Image removed successfully");
      loadImages();
    } catch (err: any) {
      alert(err.message || "Failed to remove image");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePullImage = async () => {
    if (!pullImageName.trim()) return alert("Please input image name");
    setPulling(true);
    try {
      await pullImage(pullImageName.trim());
      alert(`Pulled image: ${pullImageName.trim()}`);
      setPullImageName("");
      loadImages();
    } catch (err: any) {
      alert(err.message || "Failed to pull image");
    } finally {
      setPulling(false);
    }
  };

  const filteredImages = images.filter((img) => {
    if (!img.RepoTags) return false;
    return img.RepoTags.some((tag) =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 text-lg">
          Images ({filteredImages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Pull image input + button */}
        <div className="flex items-center gap-3 mb-4">
          <SearchBar
            placeholder="e.g. nginx:latest"
            value={pullImageName}
            onChange={setPullImageName}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 bg-blue-50 text-blue-700 border-blue-200 text-sm"
            onClick={handlePullImage}
            disabled={pulling}
          >
            <Download className="w-4 h-4 mr-1" />
            {pulling ? "Pulling..." : "Pull Image"}
          </Button>
        </div>

        {/* Images table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-600">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Image ID
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Repository:Tag
                  </TableHead>
                  <TableHead className="text-gray-600 text-base whitespace-nowrap">
                    Size
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
                {filteredImages.map((image) => (
                  <TableRow
                    key={image.Id}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell className="font-mono text-sm text-gray-600 whitespace-nowrap">
                      {image.Id.substring(7, 19)}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800 text-base whitespace-nowrap">
                      {image.RepoTags?.join(", ") || "<none>"}
                    </TableCell>
                    <TableCell className="text-gray-600 text-base whitespace-nowrap">
                      {formatSize(image.Size)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-base whitespace-nowrap">
                      {formatDate(image.Created)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-sm"
                        onClick={() => handleRemove(image.Id)}
                        disabled={actionLoadingId === image.Id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {actionLoadingId === image.Id
                          ? "Removing..."
                          : "Remove"}
                      </Button>
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

export default function ImagesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SidebarInset>
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Images" />
        <main className="flex-1 p-6 space-y-6">
          <SearchBar
            placeholder="Search images by repository or tag..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <ImagesTable searchTerm={searchTerm} />
        </main>
      </div>
    </SidebarInset>
  );
}
