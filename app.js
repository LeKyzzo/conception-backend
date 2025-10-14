const express = require("express");
const app = express();
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

app.use((req, res) => {
  res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
