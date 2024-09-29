const Question = require("../models/question");

exports.filterBy = async (req, res) => {
    const categories = req.query.categories ? req.query.categories.split(",") : undefined;
    const complexities = req.query.complexities ? req.query.complexities.split(",") : undefined;
    const keywords = req.query.keywords ? req.query.keywords.split(",") : undefined;
    if (!categories && !complexities && !keywords) {
        res.send("No filter found");
        return;
    }
    let query = {};
    if (categories) {
        query.category = { $in: categories };
    }

    if (complexities) {
        query.complexity = { $in: complexities };
    }

    if (keywords) {
        query.$or = [
            { title: { $regex: keywords.join('|'), $options: 'i' } },
            { description: { $regex: keywords.join('|'), $options: 'i' } }
        ];
    }


    const queryResult = await Question.find(query).exec();
    if (!queryResult || queryResult.length === 0) {
        res.send("No matching questions found!")
        return;
    }

    res.json(queryResult);
    return;
};