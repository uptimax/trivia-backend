const express = require('express');
const {checkQuizStatus, enterQuiz, markQuizAsCompleted, redeemQuiz, checkExpiryStatus,} = require('../controllers/quizController');

const router = express.Router();

// router.post('/check_quiz_status', checkQuizStatus);
// router.post('/enter_quiz', enterQuiz);
// router.post('/redeem_quiz', redeemQuiz);


router.post('/mark_quiz', markQuizAsCompleted);
router.post('/check_expiry_status', checkExpiryStatus);

module.exports = {
    routes: router
}