const express = require("express");
const app = express();
// parse JSON bodies (for POST requests)
app.use(express.json());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/some-html", (req, res) => {
  res.send("<html><body><h1>bonjour html</h1></body></html>");
});

app.get("/some-json", (req, res) => {
  const obj = { age: 22, nom: "Jane" };
  res.json(obj);
});

app.get("/transaction", (req, res) => {
  const transactions = [100, 2000, 3000];
  res.json({ transactions, headers: req.headers, body: req.body });
});

// /query-example?name=Matéo&age=20
app.get("/query-example", (req, res) => {
  res.json({ query: req.query });
});

app.get("/exo-query-string", (req, res) => {
  console.log(req.query);
  const age = req.query.age;
  if (age) {
    res.send(`<h1>${age}</h1>`);
  } else {
    res.send("hello");
  }
});

// /item/1
app.get("/item/:id", (req, res) => {
  res.json({ params: req.params });
});

app.get("/get-user/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log("get-user userId =", userId);
  res.send(`<h1>userId: ${userId}</h1>`);
});

app.post("/data", (req, res) => {
  console.log("POST /data body =", req.body);
  res.json(req.body);
});

let tasks = [];
let nextTaskId = 1;

// GET /tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// POST /new-task
// expected body: { title: string, description: string, isDone: boolean }
app.post("/new-task", (req, res) => {
  const { title, description, isDone } = req.body;
  const task = {
    id: nextTaskId++,
    title: title || "",
    description: description || "",
    isDone: !!isDone,
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PUT /update-task/:id
app.put("/update-task/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  const { title, description, isDone } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (isDone !== undefined) task.isDone = !!isDone;
  res.json(task);
});

// DELETE /delete-task/:id
app.delete("/delete-task/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });
  const removed = tasks.splice(idx, 1)[0];
  res.json(removed);
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
