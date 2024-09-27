const z = require("zod");
const questionIdSchema = z.number().int().positive();

exports.validateQuestionId = (req, res, next) => {
    parsedId = questionIdSchema.safeParse(Number(req.params.questionId));
    if (!parsedId.success) {
        res.sendStatus(400).send(`Invalid Question ID ${req.params.questionId}`)
        return
    }
    next();
}