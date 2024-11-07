import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import axios from 'axios';
import {
  createUser as _createUser,
  deleteUserById as _deleteUserById,
  findAllUsers as _findAllUsers,
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByUsername as _findUserByUsername,
  findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
  findUserQuestionHistory as _findUserQuestionHistory,
  countUniqueQuestionsAttempted as _countUniqueQuestionsAttempted,
  addOrUpdateQuestionHistory as _addOrUpdateQuestionHistory,
  sumTotalAttemptsByUser as _sumTotalAttemptsByUser,
  getTotalQuestionsAvailable as _getTotalQuestionsAvailable,
  updateUserById as _updateUserById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
  findQuestionAttemptDetails as _findQuestionAttemptDetails,
} from "../model/repository.js";

export async function createUser(req, res) {
  try {
    const { username, email, password } = req.body;
    if (username && email && password) {
      const existingUserByUsername = await _findUserByUsername(username);
      const existingUserByEmail = await _findUserByEmail(email);
      
      if (existingUserByEmail) {
        // Check if the user exists but is not verified
        if (!existingUserByEmail.isVerified && username == existingUserByEmail.username) {
          // Return a specific message indicating the user is not verified
          return res.status(403).json({ 
            message: "This user has already registered but has not yet verified their email. Please check your inbox for the verification link.",
            data: formatUserResponse(existingUserByEmail), 
          });
        }
        // Return conflict error if the user is already verified
        return res.status(409).json({ message: "email already exists" });
      }
      if (existingUserByUsername){
        return res.status(409).json({
          message: "username already exists."
        });
      }
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const createdUser = await _createUser(username, email, hashedPassword);
      return res.status(201).json({
        message: `Created new user ${username} successfully`,
        data: formatUserResponse(createdUser),
      });
    } else {
      return res.status(400).json({ message: "username and/or email and/or password are missing" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when creating new user!" });
  }
}

export async function checkUserExistByEmailorId(req, res) {
  try {
    const { id, email } = req.query;
    if (!id && !email ) {
      return res.status(400).json({ message: "Either 'id' or 'email' is required." });
    }

    const user = email ? await _findUserByEmail(email): await _findUserById(id);

    if (!user) {
      const identifier = email ? email : id;
      const identifierType = email ? 'email' : 'id';
      return res.status(404).json({ message: `User with ${identifierType} '${identifier}' not found` });
    } 

    return res.status(200).json({
      message: `User found`, 
      data: {
        username: user.username,
      } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when checking user by email!" });
  }
}

export async function getUser(req, res) {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      return res.status(200).json({ message: `Found user`, data: formatUserResponse(user) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting user!" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await _findAllUsers();

    return res.status(200).json({ message: `Found users`, data: users.map(formatUserResponse) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when getting all users!" });
  }
}

export async function updateUser(req, res) {
  try {
    const { username, email, password, isVerified } = req.body;
    if (username || email || password || isVerified) {
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      if (username || email) {
        let existingUser = await _findUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "username already exists" });
        }
        existingUser = await _findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ message: "email already exists" });
        }
      }

      let hashedPassword;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(password, salt);
      }
      const updatedUser = await _updateUserById(userId, username, email, hashedPassword, isVerified);
      return res.status(200).json({
        message: `Updated data for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "No field to update: username and email and password are all missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user!" });
  }
}

export async function updateUserPrivilege(req, res) {
  try {
    const { isAdmin } = req.body;

    if (isAdmin !== undefined) {  // isAdmin can have boolean value true or false
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const updatedUser = await _updateUserPrivilegeById(userId, isAdmin === true);
      return res.status(200).json({
        message: `Updated privilege for user ${userId}`,
        data: formatUserResponse(updatedUser),
      });
    } else {
      return res.status(400).json({ message: "isAdmin is missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user privilege!" });
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }
    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    await _deleteUserById(userId);
    return res.status(200).json({ message: `Deleted user ${userId} successfully` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when deleting user!" });
  }
}

export async function getUserHistory(req, res) {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    // Fetch question history for the user
    const history = await _findUserQuestionHistory(userId);
    if (!history || history.length === 0) {
      return res.status(404).json({ message: `No question history found for user ${userId}` });
    }

    console.log("Found history:", history);

    // Format the response according to the required structure
    const formattedHistory = history.map(record => ({
      attemptDate: record.attemptDate,
      attemptCount: record.attemptCount,
      attemptTime: record.attemptTime,
      question: {
        id: record.question.id,
        title: record.question.title,
        complexity: record.question.complexity,
        category: record.question.category,
        description: record.question.description,
        link: record.question.link,
      },
    }));

    return res.status(200).json(formattedHistory);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when fetching user question history!" });
  }
}

export async function addQuestionAttempt(req, res) {
  try {
    const userId = req.params.userId;
    const { questionId, timeSpent, code, language} = req.body;
    console.log("language received: ", language)
    const parsedId = Number(questionId);
    console.log(parsedId);

    // Validate userId and questionId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (typeof parsedId !== 'number') {
      return res.status(400).json({ message: "Invalid question ID" });
    }
    if (!timeSpent || typeof timeSpent !== 'number') {
      return res.status(400).json({ message: "Invalid time spent" });
    }

    const questionServiceUrl = `http://question:2000/questions/byId/${parsedId}`;

    
    // Fetch question data from question-service
    const response = await axios.get(questionServiceUrl);
    const question = response.data;

    console.log("Found question:", question);
    // Add or update the question attempt in the user's question history
    const updated = await _addOrUpdateQuestionHistory(userId, question._id, timeSpent, code, language);

    if (updated) {
      return res.status(200).json({ message: "Question history updated successfully." });
    } else {
      return res.status(500).json({ message: "Error updating question history." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating question history!" });
  }
}

export async function getUserStats(req, res) {
  try {
    const userId = req.params.userId;

    // Validate userId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Fetch total questions available
    const totalQuestionsAvailable = await _getTotalQuestionsAvailable();

    // Fetch user's question history stats
    const questionsAttempted = await _countUniqueQuestionsAttempted(userId);
    const totalAttempts = await _sumTotalAttemptsByUser(userId);

    // Respond with the aggregated statistics
    return res.status(200).json({
      totalQuestionsAvailable,
      questionsAttempted,
      totalAttempts,
    });
  } catch (err) {
    console.error("Error fetching user statistics:", err);
    return res.status(500).json({ message: "Unknown error when fetching user statistics!" });
  }
}

export async function getQuestionAttemptDetails(req, res) {
  const userId = req.params.userId;
  const questionId = req.params.questionId;
  const parsedId = Number(questionId);
  console.log(parsedId);

  if (typeof parsedId !== 'number') {
    return res.status(400).json({ message: "Invalid question ID" });
  }

  const questionServiceUrl = `http://question:2000/questions/byId/${parsedId}`;

    
  // Fetch question data from question-service
  const response = await axios.get(questionServiceUrl);
  const question = response.data;

  console.log("Found question:", question);

  try {
    const attemptDetails = await _findQuestionAttemptDetails(userId, question._id);

    if (attemptDetails) {
      return res.status(200).json(attemptDetails);
    } else {
      return res.status(404).json({ message: "No details found for this question attempt." });
    }
  } catch (err) {
    console.error("Error fetching question attempt details:", err);
    return res.status(500).json({ message: "Unknown error when fetching question attempt details!" });
  }
}


export function formatUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}
