function generateRandomString() {

};

const express = require("express");
const app = express();

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.use(express.urlencoded({ extended: true }));
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.post("/urls", (req, res) => {
  const id = generateRandomString(); // Generate a random ID
  const longURL = req.body.longURL; // Extract the longURL from the request body
  urlDatabase[id] = longURL; // Add the new key-value pair to the urlDatabase
  res.redirect(`/urls/${id}`); // Redirect to /urls/:id
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Get the ID from the request parameters
  const longURL = urlDatabase[id]; // Retrieve the long URL from the urlDatabase using the ID

  if (longURL) {
    res.redirect(longURL); // Redirect to the long URL
  } else {
    res.status(404).send("URL not found"); // Handle case when the ID doesn't exist in the urlDatabase
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});