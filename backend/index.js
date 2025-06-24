const express = require("express");
const cors = require("cors");
const Docker = require("dockerode");

const app = express();
const docker = new Docker({ socketPath: "/var/run/docker.sock" });

app.use(cors());
app.use(express.json());  // HARUS ADA biar req.body bisa terbaca

// Containers
app.get("/api/containers", async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stop, Start, Restart, Remove
app.post("/api/container/:action", async (req, res) => {
  const { action } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Container name is required" });

  try {
    const container = docker.getContainer(name.replace("/", ""));

    if (action === "stop") {
      await container.stop();
    } else if (action === "start") {
      await container.start();    // <== Tambahkan ini untuk start container
    } else if (action === "restart") {
      await container.restart();
    } else if (action === "remove") {
      await container.remove({ force: true });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    res.json({ message: `Container ${name} ${action}ed successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: `Failed to ${action} container: ${err.message}` });
  }
});

// Get all images
app.get("/api/images", async (req, res) => {
  try {
    const images = await docker.listImages();
    // images array dengan objek image dari Docker API
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/images/pull", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Image name is required" });

  try {
    await new Promise((resolve, reject) => {
      docker.pull(name, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, onFinished, onProgress);

        function onFinished(err, output) {
          if (err) reject(err);
          else resolve(output);
        }

        function onProgress(event) {
          // optionally log download progress
        }
      });
    });

    res.json({ message: `Image ${name} pulled successfully` });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Failed to pull image ${name}: ${err.message}` });
  }
});

// Remove image by ID or repo:tag (body: { id: string })
app.post("/api/images/remove", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Image ID is required" });

  try {
    const image = docker.getImage(id);
    await image.remove();
    res.json({ message: `Image ${id} removed successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all volumes
app.get("/api/volumes", async (req, res) => {
  try {
    const data = await docker.listVolumes();
    // data.Volumes is array volume objects
    res.json(data.Volumes || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove volume by name
app.post("/api/volumes/remove", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Volume name is required" });

  try {
    const volume = docker.getVolume(name);
    await volume.remove();
    res.json({ message: `Volume ${name} removed successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Networks
app.get("/api/networks", async (req, res) => {
  try {
    const networks = await docker.listNetworks();
    res.json(networks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tambahkan di bawah route networks GET:
app.post("/api/networks/remove", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Network ID is required" });

  try {
    const network = docker.getNetwork(id);
    await network.remove();
    res.json({ message: `Network ${id} removed successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://backend:${PORT}`);
});
