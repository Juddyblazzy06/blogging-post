const request = require('supertest')
const express = require('express')
const mongoose = require('mongoose')
const Article = require('../models/article') // Mocked model
const router = require('../routes') // The routes you're testing

jest.mock('../models/article') // Mock the Article model

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/', router)

describe('Routes Testing', () => {
  beforeAll(async () => {
    // Mock connection to a test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('GET /', () => {
    it('should return a list of published articles with pagination', async () => {
      // Mock data
      const articles = [
        {
          title: 'Published Article 1',
          createdAt: new Date(),
          status: 'Published',
        },
        {
          title: 'Published Article 2',
          createdAt: new Date(),
          status: 'Published',
        },
        {
          title: 'Published Article 3',
          createdAt: new Date(),
          status: 'Published',
        },
      ]
      const count = 3

      // Mock the aggregation pipeline and countDocuments
      Article.aggregate.mockResolvedValueOnce(articles)
      Article.countDocuments.mockResolvedValueOnce(count)

      const response = await request(app).get('/?page=1')

      expect(response.status).toBe(200)
      expect(response.text).toContain('Published Article 1')
      expect(response.text).toContain('Published Article 2')
      expect(response.text).toContain('Published Article 3')
    })

    it('should handle errors gracefully', async () => {
      // Simulate an error
      Article.aggregate.mockRejectedValueOnce(new Error('Database error'))

      const response = await request(app).get('/?page=1')

      expect(response.status).toBe(500) // Expecting server error
    })
  })

  describe('GET /article/:id', () => {
    it('should return the article and increment its view count', async () => {
      const mockArticle = {
        _id: '639f8abc1a6b2d3456789012',
        title: 'Article Title',
        description: 'Article Description',
        readCount: 5,
        save: jest.fn(), // Mock save method
        populate: jest.fn().mockReturnThis(), // Mock populate chaining
        exec: jest.fn().mockResolvedValue({
          title: 'Article Title',
          description: 'Article Description',
          readCount: 6,
        }),
      }

      Article.findById.mockResolvedValue(mockArticle)

      const response = await request(app).get(
        '/article/639f8abc1a6b2d3456789012'
      )

      expect(response.status).toBe(200)
      expect(mockArticle.save).toHaveBeenCalled()
      expect(response.text).toContain('Article Title')
    })

    it('should redirect to / if the article is not found', async () => {
      Article.findById.mockResolvedValueOnce(null)

      const response = await request(app).get('/article/123')

      expect(response.status).toBe(302)
      expect(response.header.location).toBe('/')
    })
  })

  describe('POST /search', () => {
    it('should return search results', async () => {
      const mockArticles = [
        { title: 'Node.js Guide' },
        { title: 'Express Tutorial' },
      ]

      Article.find.mockResolvedValue(mockArticles)

      const response = await request(app)
        .post('/search')
        .send({ searchTerm: 'Node' })

      expect(response.status).toBe(200)
      expect(response.text).toContain('Node.js Guide')
      expect(response.text).toContain('Express Tutorial')
    })

    it('should handle errors gracefully during search', async () => {
      Article.find.mockRejectedValue(new Error('Database error'))

      const response = await request(app)
        .post('/search')
        .send({ searchTerm: 'Node' })

      expect(response.status).toBe(500)
    })
  })
})
