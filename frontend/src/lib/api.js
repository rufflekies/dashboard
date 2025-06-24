const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Containers
export async function fetchContainers() {
  const res = await fetch(`${API_URL}/api/containers`);
  if (!res.ok) throw new Error("Failed to fetch containers");
  return res.json();
}

export async function containerAction(action, name) {
  if (!name) throw new Error("Container name is required");
  const res = await fetch(`${API_URL}/api/container/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || `Failed to ${action} container`);
  }
  return res.json();
}

// Images
export async function fetchImages() {
  const res = await fetch(`${API_URL}/api/images`);
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export async function pullImage(name) {
  if (!name) throw new Error("Image name is required");
  const res = await fetch(`${API_URL}/api/images/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to pull image");
  }
  return res.json();
}

export async function removeImage(id) {
  if (!id) throw new Error("Image ID is required");
  const res = await fetch(`${API_URL}/api/images/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to remove image");
  }
  return res.json();
}

// Volumes
export async function fetchVolumes() {
  const res = await fetch(`${API_URL}/api/volumes`);
  if (!res.ok) throw new Error("Failed to fetch volumes");
  return res.json();
}

export async function removeVolume(name) {
  if (!name) throw new Error("Volume name is required");
  const res = await fetch(`${API_URL}/api/volumes/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to remove volume");
  }
  return res.json();
}

// Networks
export async function fetchNetworks() {
  const res = await fetch(`${API_URL}/api/networks`);
  if (!res.ok) throw new Error("Failed to fetch networks");
  return res.json();
}

export async function removeNetwork(id) {
  if (!id) throw new Error("Network ID is required");
  const res = await fetch(`${API_URL}/api/networks/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to remove network");
  }
  return res.json();
}
