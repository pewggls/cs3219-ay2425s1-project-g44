import mongoose from "mongoose";

const QuestionHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question", // assuming there's a Question model
    required: true,
  },
  attemptDate: {
    type: Date,
    required: true,
  },
  attemptCount: {
    type: Number,
    required: true,
    default: 1,
  },
  attemptTime: {
    type: Number, // time in seconds
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  }
});

export default mongoose.model("QuestionHistory", QuestionHistorySchema);
