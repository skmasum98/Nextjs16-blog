import asyncHandler from "express-async-handler";
import slugify from "slugify";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import Category from "../models/Category.js";

const createPost = asyncHandler(async (req, res) => {
  // req.user is populated by the `protect` middleware
  const {
    title,
    content,
    category,
    tags,
    featuredImage,
    status,
    metaTitle,
    metaDescription,
  } = req.body;

  // Basic Validation (Check required fields)
  if (!title || !content || !category || !featuredImage) {
    res.status(400);
    throw new Error(
      "Please include all required fields: Title, Content, Category, and Featured Image."
    );
  }

  // Use slugify, convert to lowercase, and allow only basic characters
  let postSlug = slugify(title, { lower: true, strict: true });

  // 2. Check if a post with this slug already exists (for uniqueness)
  // If it exists, append a number
  let slugExists = await Post.findOne({ slug: postSlug });
  let counter = 1;
  while (slugExists) {
    counter++;
    postSlug = `${slugify(title, { lower: true, strict: true })}-${counter}`;
    slugExists = await Post.findOne({ slug: postSlug });
  }

  // 3. Create the post
  const post = new Post({
    user: req.user._id,
    title,
    slug: postSlug,
    content,
    category,
    tags: tags || [],
    featuredImage,
    status: status || "Draft",
    metaTitle,
    metaDescription,
  });

  const createdPost = await post.save();

  res.status(201).json(createdPost);
});

const getPublishedPosts = asyncHandler(async (req, res) => {
  const { keyword, category, page = 1, limit } = req.query;

  let filter = { status: "Published" };

  if (keyword) {
    filter.title = { $regex: keyword, $options: "i" };
  }

  if (category) {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      filter.category = categoryDoc.name;
    } else {
      return res.json({ posts: [], page: 1, totalPages: 0, totalPosts: 0 });
    }
  }

  // Convert to numbers
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  // Count total matching posts
  const totalPosts = await Post.countDocuments(filter);

  // Fetch only one page of posts
  const posts = await Post.find(filter)
    .populate("user", "name profilePicture bio")
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const totalPages = Math.ceil(totalPosts / limitNumber);

  res.json({
    posts,
    page: pageNumber,
    totalPages,
    totalPosts,
  });
});

const getPostBySlug = asyncHandler(async (req, res) => {
  // Find the post by the slug from the URL parameters
  const post = await Post.findOne({ slug: req.params.slug }).populate(
    "user",
    "name profilePicture bio"
  ); // Populate the author's name, profile picture, and bio

  if (post) {
    // Only return published posts to the public
    // Admin/Author edit checks will be handled in a different route later
    if (post.status !== "Published") {
      res.status(404);
      throw new Error("Post not found or not yet published");
    }

    res.json(post);
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

const toggleReaction = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { action } = req.body; // 'like' or 'dislike'
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  let isLiked = post.likes.includes(userId);
  let isDisliked = post.dislikes.includes(userId);

  if (action === "like") {
    if (isLiked) {
      // Remove like
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
      // If the user previously disliked, remove the dislike
      if (isDisliked) {
        post.dislikes.pull(userId);
      }
    }
  } else if (action === "dislike") {
    if (isDisliked) {
      // Remove dislike
      post.dislikes.pull(userId);
    } else {
      post.dislikes.push(userId);
      // If the user previously liked, remove the like
      if (isLiked) {
        post.likes.pull(userId);
      }
    }
  } else {
    res.status(400);
    throw new Error("Invalid reaction action");
  }

  const updatedPost = await post.save();

  res.json({
    likes: updatedPost.likes.length,
    dislikes: updatedPost.dislikes.length,
  });
});

const suspendPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    // --- CORRECT TOGGLE LOGIC ---
    let newStatus;
    if (post.status === "Suspended") {
      // If it was Suspended, change it back to Published
      newStatus = "Published";
    } else {
      // If it was Published or Draft, change it to Suspended
      newStatus = "Suspended";
    }

    post.status = newStatus;
    await post.save();

    res.json({
      message: `Post status changed to ${newStatus} successfully`,
      status: post.status, // Return the actual new status
    });
  } else {
    res.status(404);
    throw new new Error("Post not found")();
  }
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);

  if (post) {
    // Also delete all associated comments (Cascading Delete Logic)
    await Comment.deleteMany({ post: postId });
    await post.deleteOne();

    res.json({
      message: "Post and all associated comments deleted successfully",
    });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

const getAllPostsAdmin = asyncHandler(async (req, res) => {
  // Return all posts, populate author name
  const posts = await Post.find({})
    .populate("user", "name profilePicture bio")
    .sort({ createdAt: -1 });
  res.json(posts);
});

const getMyPosts = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware
  const posts = await Post.find({ user: req.user._id }) // Filter by logged-in user's ID
    .sort({ createdAt: -1 });

  res.json(posts);
});

const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const {
    title,
    content,
    category,
    tags,
    featuredImage,
    status,
    metaTitle,
    metaDescription,
  } = req.body;

  const post = await Post.findById(postId);

  if (post) {
    // --- 1. Ownership Check (CRITICAL) ---
    if (post.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("User not authorized to update this post.");
    }

    // --- 2. SUSPEND LOCK LOGIC (The Fix) ---
    let newStatus = status; // Start with the status submitted by the user

    if (post.status === "Suspended") {
      // If the user tries to change the status from Suspended to anything else
      if (status && status !== "Suspended") {
        res.status(403);
        throw new Error(
          "Post is currently suspended by Admin and cannot be published or set to draft."
        );
      }
      // Overwrite the submitted status and retain the 'Suspended' status
      newStatus = "Suspended";
    }

    // --- 3. Update Fields ---

    // Handle slug change if title changes
    let postSlug = post.slug;
    if (title && title !== post.title) {
      postSlug = slugify(title, { lower: true, strict: true });
      // NOTE: For simplicity, we skip the unique slug check here.
    }

    // Update fields: Use submitted value if present, otherwise use existing post value
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.featuredImage = featuredImage || post.featuredImage;
    // Apply the status (either the user's non-suspended status OR the Admin's 'Suspended' lock)
    post.status = newStatus || post.status;

    post.metaTitle = metaTitle || post.metaTitle;
    post.metaDescription = metaDescription || post.metaDescription;
    post.slug = postSlug; // Update slug if title was updated

    const updatedPost = await post.save();
    res.json(updatedPost);
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(
    "user",
    "name profilePicture bio"
  ); // Populate author's name, profile picture, and bio

  if (post) {
    // Ownership Check: Author can view Draft/Suspended, Admin can view all
    if (
      post.user._id.toString() === req.user._id.toString() ||
      req.user.role === "Admin"
    ) {
      res.json(post);
    } else {
      // Regular user trying to fetch another user's post by ID
      res.status(403);
      throw new Error("Not authorized to view this post.");
    }
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

const deletePostByUser = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);

  if (post) {
    // --- Ownership Check (CRITICAL) ---
    // Ensure the post author ID matches the logged-in user ID (req.user._id)
    if (post.user.toString() !== req.user._id.toString()) {
      res.status(403); // Forbidden
      throw new Error("User not authorized to delete this post.");
    }

    // Delete post and its associated comments
    await Comment.deleteMany({ post: postId });
    await post.deleteOne();

    res.json({ message: "Post and associated comments deleted successfully" });
  } else {
    res.status(404);
    throw new Error("Post not found");
  }
});

const getPostsByAuthor = asyncHandler(async (req, res) => {
  const authorId = req.params.id;

  // Find all published posts by this author ID
  const posts = await Post.find({
    user: authorId,
    status: "Published",
  })
    .populate("user", "name profilePicture bio")
    .sort({ createdAt: -1 });

  res.json(posts);
});

const getLatestPosts = asyncHandler(async (req, res) => {
  const excludeId = req.params.excludeId;

  // Build the query to find published posts AND exclude the current post ID
  const query = {
    status: "Published",
    _id: { $ne: excludeId }, // $ne = Not Equal (Exclude the current post ID)
  };

  const posts = await Post.find(query)
    .select("title slug") // Only fetch fields needed for the link
    .sort({ createdAt: -1 })
    .limit(5); // Limit to 5 posts

  res.json(posts);
});

export {
  createPost,
  getPublishedPosts,
  getPostBySlug,
  toggleReaction,
  suspendPost,
  deletePost,
  getAllPostsAdmin,
  getMyPosts,
  updatePost,
  getPostById,
  deletePostByUser,
  getPostsByAuthor,
  getLatestPosts,
};
