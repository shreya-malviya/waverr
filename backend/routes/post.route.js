const express = require('express');
const { isAuthenticatedUser } = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const { postSomething, addComment, deletePost, likePost, fetchOurPosts, fetchAllPosts } = require('../controllers/post.controller');
const storage = multer.memoryStorage();
const upload = multer({storage: storage})

router.route('/post/upload').post(isAuthenticatedUser,upload.single("image"),postSomething);
router.route('/post/comment/:id').post(isAuthenticatedUser,addComment);
router.route('/post/delete/:id').delete(isAuthenticatedUser,deletePost);
router.route('/post/like/:id').put(isAuthenticatedUser,likePost);
router.route('/post/findOurPosts').get(isAuthenticatedUser,fetchOurPosts);
router.route('/posts/findAll').get(isAuthenticatedUser,fetchAllPosts);


module.exports = router;