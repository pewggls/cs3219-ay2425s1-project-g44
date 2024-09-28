const request = require('supertest');
const express = require('express');
const questionController = require('../questionController');
const Question = require('../../models/question');

// Mock the Question model to simulate database operations
jest.mock('../../models/question');

const app = express();
app.use(express.json());

// Define the routes using the functions from the controller
app.patch('/questions/:questionId', questionController.patchQuestion);
app.post('/questions', questionController.addQuestion);
app.delete('/questions/:questionId', questionController.deleteQuestion);
app.put('/questions/:questionId', questionController.updateQuestion);

describe('PATCH /questions/:questionId', () => {
    // Test case for a successful update
    it('should update the question successfully', async () => {
        const mockQuestion = { id: 1, title: 'Updated Question' };

        // Mock the database find and update operations
        Question.findOne.mockResolvedValue(mockQuestion);
        Question.findOneAndUpdate.mockResolvedValue(mockQuestion);

        // Make a PATCH request to update the question
        const response = await request(app)
            .patch('/questions/1')
            .send({ title: 'Updated Question' });

        // Assert the response status and body
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuestion);
    });

    // Test case for when the question is not found
    it('should return 404 if question not found', async () => {
        // Mock the database find operation to return null
        Question.findOne.mockResolvedValue(null);

        // Make a PATCH request to update the question
        const response = await request(app)
            .patch('/questions/1')
            .send({ title: 'Updated Question' });

        // Assert the response status and message
        expect(response.status).toBe(404);
        expect(response.text).toBe('Question ID 1 not found.');
    });
});

describe('PUT /questions/:questionId', () => {
    // Test case for a successful update
    it('should update the question successfully', async () => {
        const mockQuestion = { id: 1, title: 'Updated Question' };

        // Mock the database find and update operations
        Question.findOne.mockResolvedValue(mockQuestion);
        Question.findOneAndReplace.mockResolvedValue(mockQuestion);

        // Make a PUT request to update the question
        const response = await request(app)
            .put('/questions/1')
            .send({ title: 'Updated Question' });

        // Assert the response status and body
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuestion);
    });

    // Test case for when the question is not found
    it('should return 404 if question not found', async () => {
        // Mock the database find operation to return null
        Question.findOne.mockResolvedValue(null);

        // Make a PUT request to update the question
        const response = await request(app)
            .put('/questions/1')
            .send({ title: 'Updated Question' });

        // Assert the response status and message
        expect(response.status).toBe(404);
        expect(response.text).toBe('Question ID 1 not found.');
    });

    // Test case for server error during update
    it('should return 500 if there is a server error', async () => {
        // Mock the database find operation to throw an error
        Question.findOne.mockRejectedValue(new Error('Server error'));

        // Make a PUT request to update the question
        const response = await request(app)
            .put('/questions/1')
            .send({ title: 'Updated Question' });

        // Assert the response status and message
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error updating question', error: 'Server error' });
    });
});