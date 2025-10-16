const express = require("express");
const {
  checkCredentials,
  issueToken,
  getRegisteredUsers,
} = require("./inMemoryUserRepository");
const app = express();
app.use(express.json());
const port = 3000;

function loggerMiddleware(req, res, next) {
  console.log("nouvelle requête entrante");
  next();
}

app.use(loggerMiddleware);

const path = require("path");
app.use("/templates", express.static(path.join(__dirname, "templates")));
app.use("/public", express.static(path.join(__dirname, "public")));

function headersLogger(req, res, next) {
  console.log("En-têtes de la requête :", req.headers);
  next();
}
app.use(headersLogger);

const activeTokens = new Map();
const userActiveToken = new Map();
const openExact = new Set([
  "/",
  "/hello",
  "/authenticate",
  "/some-html",
  "/some-json",
  "/query-example",
  "/exo-query-string",
  "/tasks",
  "/registered-users",
]);
const openPrefixes = ["/templates/", "/public/", "/item/", "/get-user/"];

function isOpenPath(pathname) {
  if (openExact.has(pathname)) return true;
  return openPrefixes.some((p) => pathname.startsWith(p));
}

function firewall(req, res, next) {
  const pathname = req.path || req.url;
  if (isOpenPath(pathname)) return next();
  const auth = req.headers["authorization"];
  const token = (auth || "").startsWith("Bearer ") ? auth.slice(7) : auth;
  const session = activeTokens.get(token);
  if (!session) {
    return res.status(403).send("Interdit");
  }
  req.authenticatedUser = session.user;
  next();
}

app.use(firewall);

app.get("/", (req, res) => {
  res.send("Bonjour le monde !");
});

app.get("/hello", (req, res) => {
  res.send("<h1>bonjour</h1>");
});

app.post("/authenticate", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({
      error: "MISSING_CREDENTIALS",
      message: "L'email et le mot de passe sont obligatoires",
    });
  }
  const result = checkCredentials(email, password);
  if (!result.ok) {
    return res.status(401).json({
      error: result.reason,
      message: "Email ou mot de passe invalide",
    });
  }

  const { user } = result;
  const existingToken = userActiveToken.get(user.id);
  if (existingToken) {
    activeTokens.delete(existingToken);
  }

  const token = issueToken();
  activeTokens.set(token, { user, issuedAt: Date.now() });
  userActiveToken.set(user.id, token);

  console.log("Nouveau jeton généré pour", email, token);
  res.json({ token, user });
});

app.get("/registered-users", (req, res) => {
  res.json({ utilisateurs: getRegisteredUsers() });
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
  res.json({ transactions, entetes: req.headers, corps: req.body });
});

app.get("/restricted1", (req, res) => {
  res.json({ message: "ultra-secret" });
});

app.get("/restricted2", (req, res) => {
  res.send("<h1>Espace administrateur</h1>");
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
    res.send("bonjour");
  }
});

// /item/1
app.get("/item/:id", (req, res) => {
  res.json({ params: req.params });
});

app.get("/get-user/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log("get-user identifiant utilisateur =", userId);
  res.send(`<h1>Utilisateur : ${userId}</h1>`);
});

app.post("/data", (req, res) => {
  console.log("POST /data corps =", req.body);
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
  if (!task) return res.status(404).json({ error: "Tâche introuvable" });
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
  if (idx === -1) return res.status(404).json({ error: "Tâche introuvable" });
  const removed = tasks.splice(idx, 1)[0];
  res.json(removed);
});

app.use((req, res) => {
  res.status(404).send("Introuvable");
});

app.listen(port, () => {
  console.log(`Application d'exemple à l'écoute sur le port ${port}`);
});
