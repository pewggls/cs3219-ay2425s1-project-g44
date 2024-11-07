import axios from 'axios';
import UserModel from "./user-model.js";
import QuestionHistory from "./questionHistory.js"; // Import the QuestionHistory model
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;

  await connect(mongoDBUri);
}

export async function createUser(username, email, password) {
  return new UserModel({ username, email, password }).save();
}

export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

export async function findUserById(userId) {
  return UserModel.findById(userId);
}

export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [
      { username },
      { email },
    ],
  });
}

export async function findAllUsers() {
  return UserModel.find();
}

export async function updateUserById(userId, username, email, password, isVerified, otp, otpExpiresAt, resetToken, resetTokenExpiresAt) {
  console.log(userId)
  console.log("db functionality, otp: ", otp)
  console.log("db functionality, otpExpiresAt: ", otpExpiresAt)
  console.log("db functionality, resetToken: ", resetToken)
  console.log("db functionality, resetTokenExpiresAt: ", resetTokenExpiresAt)

  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
        isVerified,
        otp,
        otpExpiresAt,
        resetToken,
        resetTokenExpiresAt,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true },  // return the updated user
  );
}

export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}

export async function findUserQuestionHistory(userId) {
  // Find all question history records for the user
  const history = await QuestionHistory.find({ userId });
  console.log("Fetched question history records:", history);

  // Collect all unique question IDs
  const questionIds = [...new Set(history.map(record => record.question.toString()))];
  console.log("Unique question IDs:", questionIds);

  // Fetch question details for these IDs in a single API call
  let questionDetailsMap = {};
  if (questionIds.length > 0) {
    try {
      console.log("Fetching question details for IDs:", questionIds);
      const response = await axios.post('http://question:2000/questions/batch', { ids: questionIds });
      console.log("Batch fetch response:", response.data);
      
      const questions = response.data;
      questionDetailsMap = questions.reduce((acc, question) => {
        acc[question._id] = question;
        return acc;
      }, {});
    } catch (error) {
      console.error("Error fetching questions in batch:", error.message);
    }
  }


  // Populate each history record with its corresponding question details
  console.log("Question details map:", questionDetailsMap);

  const populatedHistory = history.map(record => {
  const question = questionDetailsMap[record.question.toString()];
  console.log("Populating history record for question:", question);

  return {
    ...record.toObject(),
    question: question
      ? {
          id: question.id,
          title: question.title,
          complexity: question.complexity,
          category: question.category,
          description: question.description,
          link: question.link,
        }
      : null, // If question details are not found
  };
  });
  console.log("Populated history:", populatedHistory);


  return populatedHistory;
}

/**
 * Count the number of unique questions attempted by a user
 */
export async function countUniqueQuestionsAttempted(userId) {
  const history = await QuestionHistory.find({ userId });
  const uniqueQuestionIds = new Set(history.map(record => record.question.toString()));
  return uniqueQuestionIds.size;
}

/**
 * Sum the total attempts (including re-attempts) made by a user
 */
export async function sumTotalAttemptsByUser(userId) {
  const history = await QuestionHistory.find({ userId });
  return history.reduce((sum, record) => sum + record.attemptCount, 0);
}

/**
 * Fetch the total number of questions available from the question service
 */
export async function getTotalQuestionsAvailable() {
  const questionServiceUrl = 'http://question:2000/questions/all'; // Adjust URL as needed
  const response = await axios.get(questionServiceUrl);
  return response.data.length;
}

export async function addOrUpdateQuestionHistory(userId, questionId, timeSpent, code, language) {
  try {
    console.log("Received data in addOrUpdateQuestionHistory:", { userId, questionId, timeSpent, code, language});

    // Try to find an existing record
    console.log("Attempting to find existing history with userId and questionId...");
    const existingHistory = await QuestionHistory.findOne({ userId, question: questionId });

    if (existingHistory) {
      console.log("Existing history found. Updating the record...");
      
      // Update the existing record
      existingHistory.attemptCount += 1;
      existingHistory.attemptTime += timeSpent;
      existingHistory.attemptDate = new Date();
      existingHistory.code = code;
      existingHistory.language = language;

      // Try to save the updated document
      await existingHistory.save();
      console.log("Existing history updated successfully.");
      return true;  // Indicate that the update was successful
    } else {
      console.log("No existing history found. Creating a new record...");

      // Create a new record for the question attempt
      const newHistory = new QuestionHistory({
        userId,
        question: questionId,
        attemptDate: new Date(),
        attemptCount: 1,
        attemptTime: timeSpent,
        code: code,
        language: language
      });

      // Try to save the new document
      await newHistory.save();
      console.log("New history created successfully.");
      return true;  // Indicate that the creation was successful
    }
  } catch (error) {
    console.error("Error in addOrUpdateQuestionHistory:", error);
    throw new Error("Failed to add or update question history");
  }
}

export async function findQuestionAttemptDetails(userId, questionId) {
  // Step 1: Find the question attempt record for the user
  const attempt = await QuestionHistory.findOne({ userId, question: questionId });

  if (attempt) {
    let questionDetails = null;
    try {
      // Step 2: Fetch question details from question-service
      const response = await axios.get(`http://question:2000/questions/byObjectId/${questionId}`);
      questionDetails = response.data;
    } catch (error) {
      console.error(`Error fetching question details for questionId ${questionId}:`, error);
    }

    // Step 3: Construct the response
    return {
      attemptDate: attempt.attemptDate,
      attemptCount: attempt.attemptCount,
      attemptTime: attempt.attemptTime,
      code: attempt.code,
      language: attempt.language,
      question: questionDetails ? {
        id: questionDetails.id,
        title: questionDetails.title,
        complexity: questionDetails.complexity,
        category: questionDetails.category,
        description: questionDetails.description,
        link: questionDetails.link,
      } : null,
    };
  }

  return null;
}
