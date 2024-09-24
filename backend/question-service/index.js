const express = require("express")

const app = express()
const questionRouter = require("./routes/questionRouter")

app.use("/questions", questionRouter);

app.get("/", (req, res) => {
    res.send("Hello World")
});


const PORT = process.env.PORT || 2000

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});