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
    const queryResult = await Question.findOne().sort({ id: -1}).exec();
    if (!queryResult) {
        res.send("0");
        return
    }
    res.send(`${queryResult.id}`);
}

exports.dummyCallbackFunction = async (req, res) => {
    res.send("SENT A DUMMY RESPONSE");
};

exports.addQuestion = async (req, res) => {
    const { id, title, description, category, complexity, link } = req.body;

    var newId = id
    if (!id) {
        newId = await Question.findOne().sort({ id: -1}).exec().id;
    }

    if (!title || !description || !category || !complexity || !link) {
        return res.status(400).json({ message: 'Please enter required fields.' })
    }

    try {
        const question = await Question.create({
            newId, 
            title,
            description,
            category,
            complexity,
            link 
        })
        res.send(`Question ID ${newId} added.`)
      } catch (error) {
        res.status(400).send(error)
      }
}
