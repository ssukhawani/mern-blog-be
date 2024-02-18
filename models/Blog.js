const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  body: { type: String, required: true },
  slug: { type: String, required: true },
  posted_date: { type: Date, default: Date.now },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
});

// Cascade on delete author
blogSchema.pre("remove", async function (next) {
  try {
    // Remove all blogs associated with the author before removing the current blog
    await this.model("Blog").deleteMany({ author: this.author });
    next();
  } catch (error) {
    next(error);
  }
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
