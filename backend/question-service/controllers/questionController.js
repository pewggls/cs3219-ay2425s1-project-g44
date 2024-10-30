const z = require("zod");
const mongoose = require("mongoose");
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

exports.getQuestionByObjectId = async (req, res) => {
    const parsedId = req.params.questionObjectId;
  
    const queryResult = await Question.findById(parsedId);
    if (!queryResult) {
        res.send(`Question Object ID ${parsedId} not found.`)
        return
    }
    res.json(queryResult)
};
  
exports.getQuestionsByIds = async (req, res) => {
    const { ids } = req.body; // Extract the list of IDs from the request body
  
    // Validate that ids is an array of valid ObjectId strings
    if (!Array.isArray(ids) || ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid or missing 'ids' array in request body" });
    }
  
    try {
      // Find all questions with ObjectIds in the provided ids array
      const questions = await Question.find({ _id: { $in: ids } });
      res.json(questions); // Return the found questions as JSON
    } catch (error) {
      console.error("Error fetching questions by IDs:", error);
      res.status(500).json({ message: "Error fetching questions", error: error.message });
    }
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
        // const existingQuestion = await Question.findOne({ title: { $regex: new RegExp(`^${title}$`, "i") } }).exec();
        // if (existingQuestion) {
        //     return res.status(400).json({
        //         status: "Error",
        //         message: "Duplicate question",
        //         errors: ["A question with this title already exists."]
        //     });
        // }
        const maxId = await Question.findOne().sort({ id: -1 }).exec()
        const id = maxId ? maxId.id + 1 : 1
        const question = new Question({
            id,
            title,
            description,
            category,
            complexity,
            link
        });
        await question.save();
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
        if (error.code == 11000) {
            return res.status(404).json({
                errorCode: "DUPLICATE_TITLE",
                msg: "This title already exists."

            });
        }
        res.status(400).json({ message: error.message || "Error occured, failed to add question." })
    }
}

// const queryResult = Question.findOne({ title: 'bsdsv'}).then(res => res.deleteOne())

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
            res.status(404).send(`Question ID ${parsedId} not found.`)
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
        if (error.code == 11000) {
            return res.status(404).json({
                errorCode: "DUPLICATE_TITLE",
                msg: "This title already exists."
            });
        }
        res.status(500).json({ message: "Error updating question", error: error.message });
    }
};

exports.patchQuestion = async (req, res) => {
    try {
        const parsedId = Number(req.params.questionId)
        const queryResult = await Question.findOne({ id: parsedId });
        if (!queryResult) {
            res.status(404).send(`Question ID ${parsedId} not found.`)
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
