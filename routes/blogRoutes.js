const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const isAuthenticated = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");

// Create Blog
router.post(
  "/",
  [
    body("heading", "Heading is required").notEmpty(),
    body("body", "Body is required").notEmpty(),
    body("slug", "Slug is required").notEmpty(),
    isAuthenticated,
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { heading, body, slug } = req.body;

      const newBlog = new Blog({
        heading,
        body,
        slug,
        author: req.user,
      });

      const savedBlog = await newBlog.save();
      res.json(savedBlog);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Update Blog (requires authentication and authorization)
router.put(
  "/:id",
  [
    body("heading", "Heading is required").notEmpty(),
    body("body", "Body is required").notEmpty(),
    body("slug", "Slug is required").notEmpty(),
    isAuthenticated,
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { heading, body, slug } = req.body;

      // Check if the user is the author of the blog
      const blog = await Blog.findById(req.params.id);
      if (!blog || blog.author.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Forbidden: You are not the author of this blog" });
      }

      const updatedBlog = await Blog.findByIdAndUpdate(
        req.params.id,
        { heading, body, slug },
        { new: true }
      );

      if (!updatedBlog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      res.json(updatedBlog);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Delete Blog ( Only user who is owner of the blog can delete that blog )
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    // Check if the user is the author of the blog
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not the author of this blog" });
    }

    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get All Blogs for loggedIn User
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Filter blogs by the logged-in user's ID
    const blogs = await Blog.find({ author: req.user._id });
    if (blogs.length === 0) {
      // No blogs found for the logged-in user
      return res
        .status(404)
        .json({ message: "No blogs available for the logged-in user" });
    }

    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get All Blogs
router.get("/all", async (req, res) => {
  try {
    const blogs = await Blog.find();

    if (blogs.length === 0) {
      // No blogs found
      return res.status(404).json({ message: "No blogs available" });
    }

    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get Blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
