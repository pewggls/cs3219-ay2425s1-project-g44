const z = require("zod");
const Question = require("../models/question");

exports.getAllQuestions = async (req, res) => {
    const queryResult = await Question.find().exec();
    if (queryResult.length == 0) {
        res.send("NO QUESTIONS AVAILABLE.")
        return
    }
    res.json(queryResult);
};

exports.getQuestionById = async (req, res) => {
    const parsedId = Number(req.params.questionId)
    const queryResult = await Question.findOne({ id: parsedId });
    if (!queryResult) {
        res.send(`Question ID ${parsedId} not found.`)
        return
    }
    res.json(queryResult)
};

exports.getMaxQuestionId = async (req, res) => {
    const queryResult = await Question.findOne().sort({ id: -1 }).exec();
    if (!queryResult) {
        res.send("0");
        return
    }
    res.send(`${queryResult.id}`);
};

exports.dummyCallbackFunction = async (req, res) => {
    res.send("SENT A DUMMY RESPONSE");
};

exports.addQuestion = async (req, res) => {
    const data = req.body;
    const { title, description, category, complexity, link } = data;
    try {
        const maxId = await Question.findOne().sort({ id: -1 }).exec()
        const id = maxId ? maxId.id + 1 : 0
        const question = await Question.create({
            id,
            title,
            description,
            category,
            complexity,
            link
        })
        res.send(`Question ID ${id} added.`)
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(err => err.message)
            return res.status(400).json({
                status: "Error",
                message: "Invalid question",
                errors: messages
            });
        }
        res.status(400).json({ message: error.message || "Error occured, failed to add question." })
    }
}

exports.deleteQuestion = async (req, res) => {
    const parsedId = Number(req.params.questionId)
    try {
        const queryResult = await Question.findOne({ id: parsedId })
        await queryResult.deleteOne()
        await Question.updateMany(
            { id: { $gt: parsedId } },
            { $inc: { id: -1 } },
            {
                upsert: false,

            }
        )
        res.status(200).json({ message: `Question ID ${parsedId} deleted.` })
    } catch (error) {
        res.status(404).json({ message: `Question ID ${parsedId} not found.` })
    }
}
exports.updateQuestion = async (req, res) => {
    try {
        const parsedId = Number(req.params.questionId)
        const queryResult = await Question.findOne({ id: parsedId });
        if (!queryResult) {
            res.send(`Question ID ${parsedId} not found.`)
            return
        }
        const updates = req.body;
        console.log(req.body);
        const updatedQuestion = await Question.findOneAndReplace(
            { id: parsedId },
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: "Error updating question", error: error.message });
    }
};

exports.patchQuestion = async (req, res) => {
    try {
        const parsedId = Number(req.params.questionId)
        const queryResult = await Question.findOne({ id: parsedId });
        if (!queryResult) {
            res.send(`Question ID ${parsedId} not found.`)
            return
        }
        const updates = req.body;
        console.log(req.body);
        const updatedQuestion = await Question.findOneAndUpdate(
            { id: parsedId },
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(500).json({ message: "Error updating question", error: error.message });
    }
};