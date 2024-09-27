const Question = require("../models/question");

exports.filterBy = async (req, res) => {
    const categories = req.query.categories? req.query.categories.split(",") : undefined;
    const complexities = req.query.complexities? req.query.complexities.split(",") : undefined;
    if (!categories && !complexities) {
        res.send("No filter found");
        return;
    }
    let query = {};
    if (categories) {
        query.category = {$in: categories};
    }

    if (complexities) {
        query.complexity = {$in: complexities};
    }

    const queryResult = await Question.find(query).exec();
    if (!queryResult) {
        res.send("No matching questions found!")
    }

    res.json(queryResult);
    return;
};