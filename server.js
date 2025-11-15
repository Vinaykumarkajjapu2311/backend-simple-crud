const express = require("express");
const { randomUUID } = require("crypto");

/*
  server.js
  Simple CRUD REST API using Express and in-memory storage.
  Run: node server.js
*/

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory store
const items = [];

/* Helpers */
function findIndex(id) {
  return items.findIndex((i) => i.id === id);
}

/* Routes */

// List all items
app.get("/items", (req, res) => {
  res.json(items);
});

// Get one item
app.get("/items/:id", (req, res) => {
  const id = req.params.id;
  const item = items.find((i) => i.id === id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// Create an item
app.post("/items", (req, res) => {
  const { name, ...rest } = req.body;
  if (!name || typeof name !== "string") {
    return res
      .status(400)
      .json({ error: 'Field "name" is required and must be a string' });
  }
  const newItem = {
    id: randomUUID ? randomUUID() : String(Date.now()),
    name,
    ...rest,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Update an item (replace fields or patch)
app.put("/items/:id", (req, res) => {
  const id = req.params.id;
  const idx = findIndex(id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const { name, ...rest } = req.body;
  if (name && typeof name !== "string") {
    return res.status(400).json({ error: 'Field "name" must be a string' });
  }

  items[idx] = {
    ...items[idx],
    ...(name !== undefined ? { name } : {}),
    ...rest,
    updatedAt: new Date().toISOString(),
  };
  res.json(items[idx]);
});

// Delete an item
app.delete("/items/:id", (req, res) => {
  const id = req.params.id;
  const idx = findIndex(id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const [deleted] = items.splice(idx, 1);
  console.log("successfully deleted");
  res.json({ deleted });
});

/* Basic health check */
app.get("/", (req, res) => res.send("CRUD API running"));

/* Start server */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
