const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const { getUserByEmail, urlsForUser, generateRandomString, requireLogin } = require("./helpers");
const { urlDatabase, users } = require("./database");

const PORT = 8080;
app.set("view engine", "ejs");



app.use(
  cookieSession({
    name: "session",
    keys: ["userId"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(express.urlencoded({ extended: true }));



// Routes
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", requireLogin, (req, res) => {
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = { urls: userURLs, user: users[req.session.user_id] };
  console.log(templateVars.user);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", requireLogin, (req, res) => {
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  const user = users[req.session.user_id];
  const templateVars = { urls: userURLs, user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", requireLogin, (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];

  if (url && url.userID === req.session.user_id) {
    const templateVars = {
      id,
      longURL: url.longURL,
      user: req.session.user_id,
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Unauthorized to edit this URL");
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id] ? urlDatabase[id].longURL : undefined;

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("<html><body>The URL you requested does not exist.</body></html>");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: req.session.user_id };

  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const templateVars = { user: req.session.user_id };

  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.post("/urls", requireLogin, (req, res) => {
  const user = users[req.session.user_id];
  const longURL = req.body.longURL;

  if (!longURL) {
    res.status(400).send("Long URL cannot be empty");
    return;
  }

  const id = generateRandomString();
  urlDatabase[id] = {
    longURL,
    userID: user.id,
  };
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id", requireLogin, (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  if (!newLongURL || newLongURL.trim() === "") {
    res.status(400).send("Long URL cannot be empty");
    return;
  }

  if (urlDatabase[id] && urlDatabase[id].userID === req.session.user_id) {
    urlDatabase[id].longURL = newLongURL;
    res.redirect("/urls");
  } else if (!urlDatabase[id]) {
    res.status(404).send("URL not found");
  } else {
    res.status(403).send("Unauthorized to edit this URL");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Find the user with the matching email
  const user = getUserByEmail(email, users);

  // Check if the user exists and the password matches
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(401).send("Make sure you are registered/entered the correct email and password");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:id/delete", requireLogin, (req, res) => {
  const id = req.params.id;

  if (urlDatabase[id] && urlDatabase[id].userID === req.session.user_id) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else if (!urlDatabase[id]) {
    res.status(404).send("URL not found");
  } else {
    res.status(403).send("Unauthorized to delete this URL");
  }
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

  // Hash the password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: userId,
    email,
    password: hashedPassword, // Store the hashed password
  };

  users[userId] = newUser;

  req.session.user_id = userId;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});