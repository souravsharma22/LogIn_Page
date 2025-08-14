import express from 'express'
import { dirname } from 'path'
import { fileURLToPath } from 'url';
// import bodyParser from 'body-parser';
import pg from 'pg'
import multer from 'multer';
import fs from 'fs'

const upload = multer({ dest: 'uploads/' })
const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'College_Site',
    password: 'ss22',
    port: 5432,
});

db.connect();

const app = express()
const port = 3000;

app.use(express.static(__dirname))
// app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


app.get("/complaints", async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM complaints');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading complaints");
    }
});



app.post("/raise", upload.single("image"), async (req, res) => {
    // Create dictionary (JS object) from form

    const title = req.body.title
    const desc = req.body.desc
    const name = req.body.name
    const roll = req.body.roll
    const email = req.body.email
    const hostel = req.body.hostel
    const type = req.body.type
    const image_name = req.file ? req.file.originalname : null

    const image_data = req.file ? fs.readFileSync(req.file.path) : null;
    const result = await db.query('insert into complaints (title , description , name ,roll_no ,email ,hostel ,complaint_type , image_name , image) values ($1, $2,$3,$4,$5,$6,$7,$8, $9) ;',
        [title, desc,name , roll , email , hostel , type , image_name , image_data]
    );
    res.send(`
        <script>
            alert('complaint registerd successfully!');
            window.location.href = '/'; 
        </script>
    `);
});

app.listen(port, () => {
    console.log("lidtning on port number ", port);
})
