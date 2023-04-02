const express = require('express');
const {checkQuizStatus, enterQuiz, markQuizAsCompleted, redeemQuiz,} = require('../controllers/quizController');

const router = express.Router();

router.post('/check_quiz_status', checkQuizStatus);
router.post('/enter_quiz', enterQuiz);
router.post('/mark_quiz', markQuizAsCompleted);
router.post('/redeem_quiz', redeemQuiz);

module.exports = {
    routes: router
}