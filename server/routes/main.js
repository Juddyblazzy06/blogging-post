const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Author = require('../models/author');
const articleLayout = '../views/layouts/article';
const adminLayout = '../views/layouts/admin';

//Routes

//GET /
//Description: Landing page
router.get('/', async (req, res) => {
  try {
    const locals = {
      title: 'Blogging Website',
      description:
        'Project created for the purpose of learning Node.js and Express.js',
    }

    let perPage = 3
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

    res.render('index', {
      locals,
      articles,
      currentPage: page,
      nextPage: hasNextPage ? nextPage : null,
      prevPage: hasPrevPage ? prevPage : null,
    })
  } catch (error) {
    console.error(error)
  }
});




//GET /article/:id
//Description: Get an article by id
router.get('/article/:id', async (req, res) => {
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

    res.render('article', {
      locals,
      article,
      layout: articleLayout,
    })
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
});


// GET /view/:id
// Description: View an article by id
router.get('/view/:id', async (req, res) => {
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

//     // Increment the view count
//     let articleViewCount = article.readCount
//     articleViewCount++
//     article.readCount = articleViewCount
//     await article.save() // Save the updated article

    res.render('admin-article', {
      locals,
      article,
      layout: adminLayout,
    })
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
})


//POST /search
//Description: Search for articles

router.post('/search', async (req, res) => {
     try {
          
          let searchTerm = req.body.searchTerm;
          const locals = {
            title: 'Search Results',
            description: 'Search results for the query: ' + req.body.searchTerm,
          }

          const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9]/g, ' ');

          const articles = await Article.aggregate([
  {
    $match: {
      status: "Published", // Ensures only published articles
      $or: [
        { title: { $regex: searchNoSpecialChars, $options: "i" } },
        { description: { $regex: searchNoSpecialChars, $options: "i" } },
        { body: { $regex: searchNoSpecialChars, $options: "i" } },
        { tags: { $regex: searchNoSpecialChars, $options: "i" } }
      ]
    }
  }
]);
          res.render('search', { locals, articles });
     } catch (error) {
          console.error(error);
          res.redirect('/');
     }
});



module.exports = router;




// router.get(('', async (req, res) => {
//      try {
//           const locals = {
//             title: 'Blogging Website',
//             description:
//               'Project created for the purpose of learning Node.js and Express.js',
//           };

//           const articles = await Article.find();;
//           res.render('index', { locals, articles });
//      } catch (error) {
//           console.error(error);
//      }
// }));






// const dummyArticles = [
//   {
//     title: 'Understanding JavaScript Closures',
//     authorId: '639f8abc1a6b2d3456789012',
//     body: 'A comprehensive guide to understanding closures in JavaScript and how they work.',
//     description:
//       'This article explains the concept of closures in JavaScript with practical examples.',
//     tags: ['Programming', 'Web Development'],
//     status: 'Drafted',
//     readingTime: '4 min',
//   },
//   {
//     title: 'The Rise of Artificial Intelligence',
//     authorId: '639f8abc1a6b2d3456789013',
//     body: 'An in-depth analysis of the current trends in artificial intelligence and its future implications.',
//     description:
//       'Explore the impact of artificial intelligence on various industries and everyday life.',
//     tags: ['AI', 'Technology'],
//     status: 'Published',
//     readingTime: '6 min',
//   },
//   {
//     title: 'Effective Learning Strategies for Developers',
//     authorId: '639f8abc1a6b2d3456789014',
//     body: 'Discover proven strategies for mastering new programming languages and frameworks.',
//     description:
//       'Tips and tricks to enhance your learning process as a software developer.',
//     tags: ['Education', 'Programming'],
//     status: 'Drafted',
//     readingTime: '5 min',
//   },
//   {
//     title: 'Building Scalable Applications with Node.js',
//     authorId: '639f8abc1a6b2d3456789015',
//     body: 'Learn how to build highly scalable web applications using Node.js and modern tools.',
//     description:
//       'A step-by-step guide to designing scalable applications with Node.js.',
//     tags: ['Node.js', 'Web Development'],
//     status: 'Published',
//     readingTime: '7 min',
//   },
//   {
//     title: 'Database Optimization Techniques',
//     authorId: '639f8abc1a6b2d3456789016',
//     body: 'This article covers optimization techniques for improving database performance.',
//     description:
//       'Optimize your databases with these practical tips and techniques.',
//     tags: ['Database', 'Technology'],
//     status: 'Drafted',
//     readingTime: '6 min',
//   },
//   {
//     title: 'The Future of Coding Education',
//     authorId: '639f8abc1a6b2d3456789017',
//     body: 'An exploration of how education technology is transforming the way coding is taught.',
//     description:
//       'Understand how technology is reshaping the field of programming education.',
//     tags: ['Education', 'Coding'],
//     status: 'Published',
//     readingTime: '5 min',
//   },
//   {
//     title: 'Mastering MongoDB for Beginners',
//     authorId: '639f8abc1a6b2d3456789018',
//     body: 'This guide introduces MongoDB basics and how to use it effectively in your projects.',
//     description: 'A beginner-friendly introduction to working with MongoDB.',
//     tags: ['Database', 'Programming'],
//     status: 'Drafted',
//     readingTime: '8 min',
//   },
// ];

// function insertArticles() {
//   Article.insertMany(dummyArticles)
//     .then((articles) => {
//       console.log('Articles inserted successfully ' + dummyArticles)
//     })
//     .catch((err) => {
//       console.error(err)
//     })
// }
// // insertArticles();