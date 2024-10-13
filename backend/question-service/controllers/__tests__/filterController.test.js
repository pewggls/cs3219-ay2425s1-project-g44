const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const filterController = require('../filterController');
const Question = require('../../models/question');

const app = express();
app.use(express.json());
app.get('/filter/q', filterController.filterBy);

jest.mock('../../models/question');

// Create tests for filterBy function
describe('GET /filter/q', () => {
    // Test case for successful filtering
    it('should return questions that match the filter', async () => {
        const mockQuestions = [
            { id: 1, title: 'Question 1', category: 'Science', complexity: 'Easy' },
            { id: 2, title: 'Question 2', category: 'Math', complexity: 'Medium' },
        ];

        // Mock the database find operation with an exec function
        Question.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockQuestions)
        });

        // Make a GET request to filter the questions
        const response = await request(app)
            .get('/filter/q')
            .query({ categories: 'Science', complexities: 'Easy' });

        // Assert the response status and body
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockQuestions);
    });

    // Test case for no matching questions
    it('should return no matching questions found', async () => {
        // Mock the database find operation to return an empty array
        Question.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue([])
        });

        // Make a GET request to filter the questions
        const response = await request(app)
            .get('/filter/q')
            .query({ categories: 'Science', complexities: 'Easy' });

        // Assert the response status and message
        expect(response.status).toBe(200);
        expect(response.text).toBe('No matching questions found!');
    });

    // Test case for no filter found
    it('should return no filter found', async () => {
        // Make a GET request without any query parameters
        const response = await request(app)
            .get('/filter/q');

        // Assert the response status and message
        expect(response.status).toBe(200);
        expect(response.text).toBe('No filter found');
    });
});
