function generateRandomString() {

}

const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const users = {};
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  console.log(templateVars.user)

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"];

  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = { user };
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  const longURL = req.body.longURL;

  if (!user) {
    res.status(401).send("<html><body>You need to be logged in to shorten URLs.</body></html>");
    return;
  }

  const id = generateRandomString();
  urlDatabase[id].longURL = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    const templateVars = { id, longURL, user: req.cookies["user_id"] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;

  if (urlDatabase[id].longURL) {
    urlDatabase[id].longURL = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("<html><body>The URL you requested does not exist.</body></html>");
  }
});
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };

  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});
app.post('/login', (req, res) => {
  const { user_id } = req.body;
  res.cookie('user_id', user_id);
  res.redirect('/urls');
});
app.post('/logout', (req, res) => {
  res.clearCookie("user_id")
  res.redirect('/login')
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if (urlDatabase[id].longURL) {
    delete urlDatabase[id].longURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get('/register', (req, res) => {
  const templateVars = {};

  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
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