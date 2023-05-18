function generateRandomString() {

}

const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const users = {};
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["username"] };
  console.log(templateVars.user)

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    const templateVars = { id, longURL, user: req.cookies["username"] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  if (urlDatabase[id]) {
    urlDatabase[id] = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});
app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});
app.post('/logout', (req, res) => {
  res.clearCookie("username")
  res.redirect('/urls')
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get('/register', (req, res) => {
  const templateVars = {}
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (email === "" || password === "") {
    res.status(400).send("Email and password cannot be empty");
    return;
  }

  // Check if email already exists in the users object
  for (const userId in users) {
    if (users[userId].email === email) {
      res.status(400).send("Email already exists");
      return;
    }
  }

  const userId = generateRandomString();

  const newUser = {
    id: userId,
    email,
    password
  };

  users[userId] = newUser;

  res.cookie("user_id", userId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});