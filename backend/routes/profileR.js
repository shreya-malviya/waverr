const express = require('express');
const { isAuthenticatedUser } = require('../middleware/auth');
const { updateProfile, handleProfileUpdate, selectedProfile, showProfile ,getFriendStories,postStory, deleteStory, getSingleStory} = require('../controllers/profileC');
const router = express.Router();

const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({storage: storage})

// router.route('/updateMe').get(isAuthenticatedUser,updateProfile);
router.route('/updateMe').put(isAuthenticatedUser,upload.single('avatar'),handleProfileUpdate)
router.route('/myProfile').get(isAuthenticatedUser,showProfile)
router.route('/profile/find/:id').get(isAuthenticatedUser,selectedProfile)

// stories
router.route('/getStories').get(isAuthenticatedUser,getFriendStories)
router.route('/post/story').post(isAuthenticatedUser,upload.single('story'),postStory)
router.route('/delete/story/:id').delete(isAuthenticatedUser,deleteStory)
router.route('/story/find/:id').get(isAuthenticatedUser,getSingleStory)

module.exports = router;