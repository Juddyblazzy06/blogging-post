const express = require('express')
const router = express.Router()
const Article = require('../models/article')
const Author = require('../models/author')
const adminLayout = '../views/layouts/admin'
const loginRegisterLayout = '../views/layouts/login_register'
const adminHomeLayout = '../views/layouts/admin-home'
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authenticate = require('../middlewares/authentication')



//Routes
//GET /admin
//Description: Admin page

router.get('/login', async (req, res) => {
  try {
    const locals = {
      title: 'Login',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }

    res.render('admin/login', { locals, layout: loginRegisterLayout })
  } catch (error) {
    console.log(error)
  }
})

//Get register page
//GET /admin/register
//Description: Register page
router.get('/register', async (req, res) => {
  try {
    const locals = {
      title: 'Register',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }

    res.render('admin/register', { locals, layout: loginRegisterLayout })
  } catch (error) {
    console.log(error)
  }
})



//POST /register
//Description: Register user
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, bio } = req.body

    // Validate if username and password are provided
    if (!username || !password || !email || !firstName || !lastName) {
      return res.render('admin/register', {
        errorMessage: 'All fields are required',
        successMessage: null,
        layout: loginRegisterLayout,
      })
    }

    // Check if username or email already exists
    const existingAuthor = await Author.exists({
      $or: [{ username }, { email }],
    })
    if (existingAuthor) {
      return res.render('admin/register', {
        errorMessage: 'Username and Email already exists',
        successMessage: null,
        layout: loginRegisterLayout,
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    try {
      const author = await Author.create({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        bio,
      })
      res.status(201)
      // .json({ author })
    } catch (error) {
      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(409)
        // .json({ message: 'Username or email already exists' })
      } else {
        return res.status(500)
        // .json({ message: 'An error occurred. Please try again' })
      }
    }
    res.redirect('/login')
  } catch (error) {
    console.log(error)
  }
})

// //POST /login
// //Description: Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.render('admin/login', {
        errorMessage: 'All fields are required',
        successMessage: null,
        layout: loginRegisterLayout,
      })
    };
    console.log(email, password)
    console.log('Login Request:', { email })

    // Find the user by username
    const author = await Author.findOne({ email })
    console.log('User Found:', author)

    if (!author) {
      return res.render('admin/login', {
        errorMessage: 'Invalid credentials',
        successMessage: null,
        layout: loginRegisterLayout,
      })
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, author.password)
    console.log('Password Match:', isMatch)

    if (!isMatch) {
      return res.render('admin/login', {
        errorMessage: 'Invalid credentials',
        successMessage: null,
        layout: loginRegisterLayout,
      })
    }

    // Generate a JWT token
    const token = jwt.sign(
      { authorId: author._id, email: author.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    ) 

    // Store the token in a cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'|| false,
      sameSite: 'lax',
      maxAge: 1 * 60 * 60 * 1000,
    })

    // Redirect to tasks
    res.redirect('/admin/home')

  } catch (error) {
    console.error('Error during login:', error.message)
    res.render('admin/login', {
      errorMessage: 'Error during login. Please try again.',
      successMessage: null,
      layout: loginRegisterLayout,
    })
  }
})



//GET /dashboard
//Description: Dashboard page
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const ObjectId = require('mongoose').Types.ObjectId // Or from 'mongodb'

    if (!req.user || !req.user.authorId) {
      return res.status(401).send('User not authenticated or user ID not found')
    }

    const successMessage = req.flash('success')
    const errorMessage = req.flash('error')

    const locals = {
      title: 'Dashboard',
      description:
        'Project created for the purpose of learning Node.js and Express.js',
    }

    let perPage = 10
    let page = parseInt(req.query.page) || 1

    const userId = new ObjectId(req.user.authorId) // Fix here

    const articles = await Article.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage)

    const count = await Article.countDocuments({ authorId: userId })

    const nextPage = page + 1
    const prevPage = page - 1
    const hasNextPage = nextPage <= Math.ceil(count / perPage)
    const hasPrevPage = prevPage >= 1

    res.render('admin/dashboard', {
      locals,
      articles,
      currentPage: page,
      nextPage: hasNextPage ? nextPage : null,
      prevPage: hasPrevPage ? prevPage : null,
      layout: adminLayout,
      successMessage: successMessage.length > 0 ? successMessage[0] : null,
      errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).send('An error occurred')
  }
})





// //GET /add-article
// //Description: Add article page
router.get('/add-article', authenticate, async (req, res) => {
  try {
    const locals = {
      title: 'Add Article',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }

    res.render('admin/add-article', { locals, layout: adminLayout })
  } catch (error) {
    console.log(error)
  }
});

// //POST /add-article
// //Description: Add article
router.post('/add-article', authenticate, async (req, res) => {
  try {
    const { title, description, body, tags, readingTime } = req.body

    if (!title || !description || !body || !tags || !readingTime) {
      return res.render('admin/add-article', {
        errorMessage: 'All fields are required',
        successMessage: null,
        layout: adminLayout,
      })
    }
    const authorId = req.user.authorId

    const article = await Article.create({
      title,
      description,
      body,
      tags: tags.split(',').map((tag) => tag.trim()),
      authorId,
      readingTime,
    })

    res.status(201)
    // .json({ article })
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
});


// //GET /edit-article
// //Description: Add article page
router.get('/edit-article/:id', authenticate, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Article',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }

    const article = await Article.findById(req.params.id)
    res.render('admin/edit-article', { locals, article, layout: adminLayout })
  } catch (error) {
    console.log(error)
  }
});


// //PUT /edit-article
// //Description: Put article route
router.put('/edit-article/:id', authenticate, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Article',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
    }
    
    if (!req.body.title || !req.body.description || !req.body.body || !req.body.tags || !req.body.readingTime) {
      const article = await Article.findById(req.params.id)
      return res.render('admin/edit-article', {
        article,
        locals,
        errorMessage: 'All fields are required',
        successMessage: null,
        layout: adminLayout,
      })
    }

    const article = await Article.findByIdAndUpdate(req.params.id)
    article.title = req.body.title
    article.description = req.body.description
    article.body = req.body.body
    article.tags = req.body.tags.split(',').map((tag) => tag.trim())
    article.readingTime = req.body.readingTime
    article.updatedAt = Date.now()
    await article.save()
    

    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
});


// //DELETE /delete-article
// //Description: Delete article
router.delete('/delete-article/:id', authenticate, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/dashboard')
  } catch (error) {
    console.log(error)
  }
});

// //GET /publish-article
// //Description: Publish article
router.get('/publish-article/:id', authenticate, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    if (!article) {
      req.flash('error', 'Article not found')
      return res.redirect('/dashboard')
    }

    if (article.status === 'Published') {
      req.flash('error', 'This article is already published!')
    } else if (article.status === 'Drafted') {
      // Update the article status to "published"
      article.status = 'Published'
      article.createdAt = Date.now()
      article.updatedAt = article.createdAt
      await article.save()
      console.log('Article published:', article.status)

      req.flash('success', 'Article has been published successfully!')
    }

    // Redirect back to the dashboard or appropriate page
    res.redirect('/dashboard')

    // res.redirect('/dashboard')
  } catch (error) {
    console.error('Error while publishing article:', error)
    req.flash('error','An error occurred while publishing the article. Please try again.'
    )
    res.redirect('/dashboard')
  }
});


//GET /admin/home
//Description: Get Admin Home
router.get('/admin/home', async (req, res) => {
  try {
    const locals = {
      title: 'Blogging Website',
      description:
        'Project created for the purpose of learning Node.js and Express.js',
    }

    let perPage = 10
    let page = parseInt(req.query.page) || 1

    let articles
    try {
      // Aggregation pipeline to filter by status 'Published' and sort by newest articles first
      articles = await Article.aggregate([
        {
          $match: {
            status: 'Published', // Filter articles by published status
          },
        },
        {
          $sort: {
            createdAt: -1, // Sort by the newest articles first
          },
        },
      ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec()
    } catch (error) {
      console.error('Aggregation error:', error)
    }

    const count = await Article.countDocuments({ status: 'Published' }) // Count only published articles
    const nextPage = page + 1
    const prevPage = page - 1
    const hasNextPage = nextPage <= Math.ceil(count / perPage)
    const hasPrevPage = prevPage >= 1
//     res.json(articles)

    res.render('admin-home-index', {
      locals,
      articles,
      currentPage: page,
      nextPage: hasNextPage ? nextPage : null,
      prevPage: hasPrevPage ? prevPage : null,
      layout: adminHomeLayout,
    })
  } catch (error) {
    console.error(error)
  }
});

//GET /article/:id
//Description: Get an article by id
router.get('/admin/article/:id', async (req, res) => {
  try {
    // Use populate to join the article with the author
    const article = await Article.findById(req.params.id)
      .populate('authorId', 'firstName lastName') // Populating authorId with firstName and lastName fields
      .exec()

    if (article == null) {
      return res.redirect('/')
    }

    const locals = {
      title: article.title,
      description: article.description,
    }

    // Increment the view count
    let articleViewCount = article.readCount
    articleViewCount++
    article.readCount = articleViewCount
    await article.save() // Save the updated article

    res.render('admin-article', {
      locals,
      article,
      layout: adminLayout,
    })
  } catch (error) {
    console.error(error)
    res.redirect('/admin/home')
  }
});


// /GET /logout
//Description: Logout user
router.get('/logout', async (req, res) => {
  res.clearCookie('authToken')
  res.redirect('/')
})



module.exports = router

//POST /
//Description: Login user
// router.post('/admin', async (req, res) => {
//   try {
//     const { username, password } = req.body
//     console.log(username, password)
//     res.redirect('/login')

//     // res.render('admin/register', { locals, layout: loginRegisterLayout })
//   } catch (error) {
//     console.log(error)
//   }
// })