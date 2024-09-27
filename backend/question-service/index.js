const express = require("express")
const cors = require("cors")

const app = express()
const questionRouter = require("./routes/questionRouter")
const filterRouter = require("./routes/filterRouter");
const db = require("./config/db");

app.use(cors());
app.use("/questions", questionRouter);
app.use("/filter", filterRouter);

app.get("/", (req, res) => {
    res.send("Hello World")
});

db.connectDB();
db.populateDB();

const PORT = process.env.PORT || 2000

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});