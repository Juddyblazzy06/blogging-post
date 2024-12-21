const request = require('supertest')
const app = require('../app') // Your Express app
const Author = require('../models/author')
const Article = require('../models/article')

beforeEach(async () => {
  // Clear and prepare the database before each test
  await Author.deleteMany()
  await Article.deleteMany()
})

describe('Admin Routes', () => {
  // Tests for GET /admin/login
  describe('GET /admin/login', () => {
    it('should render the login page', async () => {
      const response = await request(app).get('/admin/login')
      expect(response.status).toBe(200)
      expect(response.text).toContain('Login') // Check for login page content
    })
  })

  // Tests for GET /admin/register
  describe('GET /admin/register', () => {
    it('should render the registration page', async () => {
      const response = await request(app).get('/admin/register')
      expect(response.status).toBe(200)
      expect(response.text).toContain('Register') // Check for registration page content
    })
  })

  // Tests for POST /admin/register
  describe('POST /admin/register', () => {
    it('should register a new user with valid input', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'A test user',
      }

      const response = await request(app).post('/admin/register').send(userData)

      expect(response.status).toBe(302) // Redirect to login
      expect(response.headers.location).toBe('/admin/login')

      const user = await Author.findOne({ username: 'testuser' })
      expect(user).toBeTruthy()
      expect(user.email).toBe('test@example.com')
    })

    it('should return an error message when required fields are missing', async () => {
      const userData = {
        username: '',
        password: '',
        email: '',
        firstName: '',
        lastName: '',
      }

      const response = await request(app).post('/admin/register').send(userData)
      expect(response.status).toBe(200) // Render page with error
      expect(response.text).toContain('All fields are required')
    })

    it('should return an error if username or email already exists', async () => {
      await Author.create({
        username: 'existinguser',
        password: 'password123',
        email: 'existing@example.com',
      })

      const userData = {
        username: 'existinguser',
        password: 'password123',
        email: 'existing@example.com',
        firstName: 'John',
        lastName: 'Doe',
      }

      const response = await request(app).post('/admin/register').send(userData)
      expect(response.status).toBe(200) // Render page with error
      expect(response.text).toContain('Username and Email already exists')
    })
  })

  // Tests for POST /admin/login
  describe('POST /admin/login', () => {
    it('should log in a user with valid credentials', async () => {
      const user = await Author.create({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      })

      const response = await request(app)
        .post('/admin/login')
        .send({ username: 'testuser', password: 'password123' })

      expect(response.status).toBe(302) // Redirect to dashboard
      expect(response.headers.location).toBe('/dashboard')
    })

    it('should return an error message for invalid credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({ username: 'wronguser', password: 'wrongpassword' })

      expect(response.status).toBe(200) // Render login with error
      expect(response.text).toContain('Invalid credentials')
    })
  })

  // Tests for GET /dashboard
  describe('GET /dashboard', () => {
    it('should render the dashboard for authenticated users', async () => {
      const user = await Author.create({
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      })

      const loginResponse = await request(app)
        .post('/admin/login')
        .send({ username: 'testuser', password: 'password123' })

      const cookie = loginResponse.headers['set-cookie']

      const response = await request(app)
        .get('/dashboard')
        .set('Cookie', cookie)

      expect(response.status).toBe(200)
      expect(response.text).toContain('Dashboard')
    })

    it('should return 401 for unauthenticated users', async () => {
      const response = await request(app).get('/dashboard')
      expect(response.status).toBe(401)
    })
  })

  // Additional tests for add-article, edit-article, delete-article, and publish-article...
  // For brevity, you can follow the same structure for these routes, testing both positive and negative cases.

  afterAll(async () => {
    // Close any open connections or perform cleanup if necessary
  })
})
