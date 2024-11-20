const express = require('express')
const verifyToken = require('../middleware/verify-token')
const Hoot = require('../models/hoot')
const router = express.Router()

// ========== Public Routes ===========

// ========= Protected Routes =========
router.use(verifyToken)
// POST /hoots
router.post('/', async (req, res) => {
  try {
    req.body.author = req.user._id
    console.log(req.user.id)
    const hoot = await Hoot.create(req.body)
    hoot._doc.author = req.user
    res.status(201).json(hoot)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
})
// GET /hoots
router.get('/', async (req, res) => {
  try {
    const hoots = await Hoot.find({})
      .populate('author')
      .sort({ createdAt: 'desc' });
    res.status(200).json(hoots);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET /hoots/my-hoot hoot by author

router.get('/my-hoots', async (req,res) => {
  try {
    const hoots = await Hoot.find({author: req.user._id})
    .populate('author')
    .sort({ createdAt: 'desc' });
    res.status(200).json(hoots)
  } catch (error) {
    res.status(500).json(error)
  }
})


// GET /hoots/:hootId

router.get('/:hootId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId).populate(['author','comments.author'])
    res.status(200).json(hoot)
  } catch (error) {
    res.status(500).json(error)
  }
})

// PUT /hoots/:hootId

router.put('/:hootId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId)
    // Check permissons
    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!")
    }
    // Update hoot
    const updatedHoot = await Hoot.findByIdAndUpdate(req.params.hootId, req.body, { new: true })

    // Append req.user to the author property
    updatedHoot._doc.author = req.user

    // Issue JSON response
    res.status(200).json(updatedHoot)
  } catch (error) {
    res.status(500).json(error)
  }
})

// DELETE /hoots/:hootId

router.delete('/:hootId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId)
    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!")
    }
    const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId)
    res.status(200).json(deletedHoot)
  } catch (error) {
    res.status(500).json(error)
  }
})

// POST /hoots/:hootId/comments

router.post('/:hootId/comments', async (req, res) => {
  try {
    req.body.author = req.user._id
    const hoot = await Hoot.findById(req.params.hootId)
    console.log(hoot)
    hoot.comments.push(req.body)
    await hoot.save()
    // Find the newly created comment 
    const newComment = hoot.comments[hoot.comments.length - 1]
    newComment._doc.author = req.user

    //Respond with the newComment
    res.status(201).json(newComment)

  } catch (error) {
    res.status(500).json(error)
  }
})

// PUT /hoots/:hootId/comments/:commentId
router.put('/:hootId/comments/:commentId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId)
    const comment = hoot.comments.id(req.params.commentId)
    comment.text = req.body.text
    await hoot.save()
    res.status(200).json({ message: 'OK' })
  } catch (error) {
    res.status(500).json(error)
  }
})

//DELETE /hoots/:hootId/comments/:commentId
router.delete('/:hootId/comments/:commentId', async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId)
    hoot.comments.remove({ _id: req.params.commentId })
    await hoot.save()
    res.status(200).json({ message: 'Ok' })
  } catch (error) {
    res.status(500).json(error)
  }
})


module.exports = router