const mongoose = require('mongoose');
const fs = require("fs");
const Question = require("../models/question");

exports.connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://oscorp4:hello123@cluster0.gshqw1i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

exports.populateDB = async () => {

  const questionList = JSON.parse(fs.readFileSync("config/questions.json", "utf-8"));
  // console.log((questionList))
  const numQuestions = await (Question.countDocuments().exec())
  if (numQuestions < 20) {
    Question.insertMany(questionList)
      .then(() => {
        console.log('Data successfully inserted into MongoDB');
      })
      .catch((error) => {
        console.error('Error inserting data:', error);
      });
  }
};