const getUserByEmail = function (email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
};
const urlsForUser = function (id, urlDatabase) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};
function generateRandomString() {
  let result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
// Middleware function to check if the user is logged in
function requireLogin(req, res, next) {
  const userId = req.session.user_id;

  if (!userId) {
    res.redirect("/login");
    return;
  }

  next();
}



module.exports = { getUserByEmail, generateRandomString, requireLogin, urlsForUser };
