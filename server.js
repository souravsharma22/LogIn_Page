import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "nitapcircle",
  password: "Soumajit@123",
  port: 3000,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});


app.post("/register", async (req, res) => {
  const { Name, Email, password, role, college_id } = req.body;

  try {
    if (!password) {
      return res.status(400).send("Enter a valid password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (name, email, password, role, college_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [Name, Email, hashedPassword, role, college_id]
    );

    res.redirect("/");
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).send("Email already exists");
    } else {
      console.error(err);
      res.status(500).send("Server error");
    }
  }
});


app.post("/login", async (req, res) => {
  const { Email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [Email]);

    if (result.rows.length === 0) {
      return res.status(400).send("User not found");
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }

    res.redirect("/problems.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log("Server running on http://localhost:4000");
});
