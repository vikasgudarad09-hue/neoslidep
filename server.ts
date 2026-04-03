import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // API routes FIRST
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/ping", (req, res) => {
    res.send("pong");
  });

  // Explicitly serve PWA files with correct MIME types
  app.get("/manifest.json", (req, res) => {
    const devPath = path.join(__dirname, "public", "manifest.json");
    const prodPath = path.join(__dirname, "dist", "manifest.json");
    const filePath = fs.existsSync(prodPath) ? prodPath : devPath;
    
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.sendFile(filePath);
    } else {
      res.status(404).send("Manifest not found");
    }
  });

  app.get("/sw.js", (req, res) => {
    const devPath = path.join(__dirname, "public", "sw.js");
    const prodPath = path.join(__dirname, "dist", "sw.js");
    const filePath = fs.existsSync(prodPath) ? prodPath : devPath;
    
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "application/javascript");
      res.setHeader("Service-Worker-Allowed", "/");
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(filePath);
    } else {
      res.status(404).send("Service Worker not found");
    }
  });

  app.get("/icon.svg", (req, res) => {
    const devPath = path.join(__dirname, "public", "icon.svg");
    const prodPath = path.join(__dirname, "dist", "icon.svg");
    const filePath = fs.existsSync(prodPath) ? prodPath : devPath;
    
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "image/svg+xml");
      res.sendFile(filePath);
    } else {
      res.status(404).send("Icon not found");
    }
  });

  app.get("/robots.txt", (req, res) => {
    const devPath = path.join(__dirname, "public", "robots.txt");
    const prodPath = path.join(__dirname, "dist", "robots.txt");
    const filePath = fs.existsSync(prodPath) ? prodPath : devPath;
    
    if (fs.existsSync(filePath)) {
      res.setHeader("Content-Type", "text/plain");
      res.sendFile(filePath);
    } else {
      res.status(404).send("Robots.txt not found");
    }
  });

  // Explicitly serve static files from public directory in dev mode
  if (process.env.NODE_ENV !== "production") {
    app.use(express.static(path.join(__dirname, "public")));
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode");
    const distPath = path.join(__dirname, "dist");
    
    if (!fs.existsSync(distPath)) {
      console.error(`Dist folder not found at ${distPath}`);
    } else {
      console.log(`Serving static files from ${distPath}`);
      const files = fs.readdirSync(distPath);
      console.log(`Files in dist: ${files.join(", ")}`);
    }

    // Production: Serve static files from dist
    app.use(express.static(distPath));
    
    // Explicit root handler
    app.get("/", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Index file not found");
      }
    });

    // SPA fallback: Serve index.html for any other route
    app.get("*", (req, res) => {
      // Handle Digital Asset Links for Play Store verification
      if (req.path === "/.well-known/assetlinks.json") {
        const assetLinksPath = path.join(distPath, ".well-known", "assetlinks.json");
        const devAssetLinksPath = path.join(__dirname, "public", ".well-known", "assetlinks.json");
        const filePath = fs.existsSync(assetLinksPath) ? assetLinksPath : devAssetLinksPath;
        
        if (fs.existsSync(filePath)) {
          res.setHeader("Content-Type", "application/json");
          return res.sendFile(filePath);
        }
      }

      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error(`index.html not found at ${indexPath}`);
        res.status(404).send(`
          <html>
            <body>
              <h1>Application Error</h1>
              <p>The application build could not be found.</p>
              <p>Please check the server logs for more details.</p>
              <p>Current directory: ${__dirname}</p>
              <p>Dist path: ${distPath}</p>
            </body>
          </html>
        `);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
