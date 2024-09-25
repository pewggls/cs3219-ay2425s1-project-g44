const express = require("express")

const app = express()
const questionRouter = require("./routes/questionRouter")
const db = require("./config/db");

app.use("/questions", questionRouter);

app.get("/", (req, res) => {
    res.send("Hello World")
});

db.connectDB();
db.populateDB();
const PORT = process.env.PORT || 2000

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});