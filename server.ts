import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

let products: Product[] = [
  { id: 1, name: "Wireless Mouse", price: 25.99, category: "Electronics", stock: 50 },
  { id: 2, name: "Mechanical Keyboard", price: 89.99, category: "Electronics", stock: 30 },
  { id: 3, name: "Coffee Mug", price: 12.50, category: "Home & Kitchen", stock: 100 },
];

let nextId = 4;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(bodyParser.json());

  // REST Endpoints

  // GET /api/products → fetch all products
  app.get("/api/products", (req, res) => {
    res.status(200).json(products);
  });

  // GET /api/products/:id → fetch single product
  app.get("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find((p) => p.id === id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  });

  // POST /api/products → create product
  app.post("/api/products", (req, res) => {
    const { name, price, category, stock } = req.body;

    // Validation
    if (!name || typeof price !== "number" || !category || typeof stock !== "number") {
      return res.status(400).json({ message: "Invalid request body. Name, price, category, and stock are required." });
    }

    if (price <= 0 || stock < 0) {
      return res.status(400).json({ message: "Price must be positive and stock must be non-negative." });
    }

    const newProduct: Product = {
      id: nextId++,
      name,
      price,
      category,
      stock,
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  });

  // PUT /api/products/:id → update product
  app.put("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, price, category, stock } = req.body;

    // Validation
    if (!name || typeof price !== "number" || !category || typeof stock !== "number") {
      return res.status(400).json({ message: "Invalid request body. Name, price, category, and stock are required." });
    }

    if (price <= 0 || stock < 0) {
      return res.status(400).json({ message: "Price must be positive and stock must be non-negative." });
    }

    products[index] = { id, name, price, category, stock };
    res.status(200).json(products[index]);
  });

  // DELETE /api/products/:id → delete product
  app.delete("/api/products/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    const deletedProduct = products.splice(index, 1);
    res.status(200).json({ message: "Product deleted successfully", product: deletedProduct[0] });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
