const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const filterController = require('../filterController');
const Question = require('../../models/question');

const app = express();
app.use(express.json());
app.get('/filter', filterController.filterBy);

jest.mock('../../models/question');

describe('filterController', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return "No filter found" if no filters are provided', async () => {
        const res = await request(app).get('/filter');
        expect(res.text).toBe('No filter found');
        expect(res.status).toBe(200);
    });

    it('should filter questions by categories', async () => {
        const mockQuestions = [{ _id: '1', category: 'math', complexity: 'easy', title: 'Question 1', description: 'Description 1' }];

        // Mocking Question.find() to return an object with exec()
        Question.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockQuestions)
        });

        const res = await request(app).get('/filter').query({ categories: 'math' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockQuestions);
        expect(Question.find).toHaveBeenCalledWith({ category: { $in: ['math'] } });
    });

    it('should filter questions by complexities', async () => {
        const mockQuestions = [{ _id: '1', category: 'math', complexity: 'easy', title: 'Question 1', description: 'Description 1' }];

        // Mocking Question.find() to return an object with exec()
        Question.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockQuestions)
        });

        const res = await request(app).get('/filter').query({ complexities: 'easy' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockQuestions);
        expect(Question.find).toHaveBeenCalledWith({ complexity: { $in: ['easy'] } });
    });

    it('should filter questions by keywords', async () => {
        const mockQuestions = [{ _id: '1', category: 'math', complexity: 'easy', title: 'Question 1', description: 'Description 1' }];

        // Mocking Question.find() to return an object with exec()
        Question.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockQuestions)
        });

        const res = await request(app).get('/filter').query({ keywords: 'Question' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockQuestions);
        expect(Question.find).toHaveBeenCalledWith({
            $or: [
                { title: { $regex: 'Question', $options: 'i' } },
                { description: { $regex: 'Question', $options: 'i' } }
            ]
        });
    });

    it('should return "No matching questions found!" if no questions match the filters', async () => {
        // Mocking Question.find() to return an empty array
        Question.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue([])
        });

        const res = await request(app).get('/filter').query({ categories: 'science' });

        expect(res.status).toBe(200);
        expect(res.text).toBe('No matching questions found!');
    });
});
