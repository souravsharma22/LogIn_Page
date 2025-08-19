import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 4000;
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db =new pg.Client({
  user: "postgres",
  host:"localhost",
  database:"login",
  password:"Soumajit@123",
  port:3000,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));




app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});
app.post("/register", async (req, res) => {
  const { Name, Email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO register (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [Name, Email, hashedPassword, role]
    );

     res.redirect('/');
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).send( "Email already exists" );
    } else {
      console.error(err);
      res.status(500).send("Server error" );
    }
  }
});


app.post("/login", async (req, res) => {
  const { Email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM register WHERE email = $1", [Email]);

    if (result.rows.length === 0) {
      return res.status(400).send( "User not found" );
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   
    res.redirect('/problems.html');

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.listen(port, () => {
  console.log("Server running on http://localhost:4000");
});
