const request = require('supertest')
const app = require('../app') // Import the app for testing

describe('App Initialization', () => {
  it('should respond to the root route with status 200', async () => {
    const res = await request(app).get('/')
    expect(res.statusCode).toBe(200)
    // Add additional checks if your root route renders a specific view or content
  })

  it('should respond to the admin route with status 200', async () => {
    const res = await request(app).get('/admin')
    expect(res.statusCode).toBe(200)
    // Add additional checks for content or redirection if applicable
  })

  it('should return 404 for an invalid route', async () => {
    const res = await request(app).get('/non-existent-route')
    expect(res.statusCode).toBe(404)
    // Optionally check for a custom 404 error message
  })
})

describe('Middleware Configuration', () => {
  it('should have cookieParser middleware configured', () => {
    expect(
      app._router.stack.some((layer) => layer.name === 'cookieParser')
    ).toBe(true)
  })

  it('should have methodOverride middleware configured', () => {
    expect(
      app._router.stack.some((layer) => layer.name === 'methodOverride')
    ).toBe(true)
  })

  it('should have flash middleware configured', () => {
    expect(app._router.stack.some((layer) => layer.name === 'flash')).toBe(true)
  })

  it('should have session middleware configured', () => {
    expect(app._router.stack.some((layer) => layer.name === 'session')).toBe(
      true
    )
  })
})

describe('Session Configuration', () => {
  it('should have a session secret', () => {
    const sessionLayer = app._router.stack.find(
      (layer) => layer.name === 'session'
    )
    expect(sessionLayer).toBeTruthy()
    expect(sessionLayer.handle).toHaveProperty(
      'options.secret',
      process.env.SESSION_SECRET
    )
  })

  it('should use MongoDB for session storage', () => {
    const sessionLayer = app._router.stack.find(
      (layer) => layer.name === 'session'
    )
    expect(sessionLayer).toBeTruthy()
    expect(sessionLayer.handle).toHaveProperty('options.store')
    expect(sessionLayer.handle.options.store).toBeDefined()
  })
})

describe('Static Files and Templating Engine', () => {
  it('should serve static files from the public folder', () => {
    expect(
      app._router.stack.some((layer) => layer.name === 'serveStatic')
    ).toBe(true)
  })

  it('should set EJS as the templating engine', () => {
    expect(app.get('view engine')).toBe('ejs')
  })

  it('should use express-ejs-layouts for layout management', () => {
    expect(
      app._router.stack.some((layer) => layer.name === 'expressLayouts')
    ).toBe(true)
  })
})

describe('Database Connection', () => {
  it('should call connectDb on initialization', () => {
    const connectDb = require('../server/config/db')
    jest.spyOn(connectDb, 'connectDb') // Spy on the connectDb function
    require('../app') // Re-require the app to trigger initialization
    expect(connectDb).toHaveBeenCalled() // Ensure it was called
  })
})
