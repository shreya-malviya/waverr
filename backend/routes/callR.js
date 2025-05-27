const express = require('express')
const { isAuthenticatedUser } = require('../middleware/auth');
const { startCall, callAccept, callReject, callEnd, callHistory } = require('../controllers/callC');
const router = express.Router();

router.route('/callStart/:id').post(isAuthenticatedUser,startCall);
router.route('/callAccept').put(isAuthenticatedUser,callAccept);
router.route('/callReject').put(isAuthenticatedUser,callReject);
router.route('/callEnd').put(isAuthenticatedUser,callEnd)
router.route('/callHistory').get(isAuthenticatedUser,callHistory)
module.exports = router;