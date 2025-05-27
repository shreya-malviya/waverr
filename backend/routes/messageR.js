const express = require('express')
const { isAuthenticatedUser } = require('../middleware/auth');
const { getMessages, sendMessage } = require('../controllers/messageC');
const router = express.Router();

router.route('/messages/:id').get(isAuthenticatedUser,getMessages); // to get all the messages between 2 users
router.route('/send/:id').post(isAuthenticatedUser,sendMessage);


module.exports = router;