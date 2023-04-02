'use strict'
const { query } = require('express');
const firebase = require('../db');
const User = require('../models/user');
const { updateQuizById } = require('../utilities/firestoreUtilities');

const firestore = firebase.firestore;

async function getQuizesQuesitions(quizeId){
    let questions = (await firestore.collection('quizes').doc(quizeId).collection('questions').get()).docs;
    return questions;
}

async function getUserQuizDoc(uid, quizeId){
    let quizes = firestore.collection('active_quizes').where("uid", '==', uid).where("quiz_id", '==', quizeId).limit(1);
    let quizesDocs = await quizes.get();

    return quizesDocs.size == 0? null: quizesDocs.docs[0];
}

async function getUserQuizByQuizId(quizId){
    let quiz = firestore.collection('active_quizes').doc(quizId);
    return quiz;
}

async function getQuizDocFromQuizes(quizeId){
    let quiz = firestore.collection('quizes').doc(quizeId);
    let doc = await quiz.get();
    return doc.exists? doc: null;
}

async function getUser(uid){
    let user = firestore.collection('users').doc(uid);
    return user;
}

async function getActiveQuiz(id){
    let quiz = firestore.collection('active_quizes').doc(uid);
    return quiz;
}

async function getQuizDataFromUser(uid, quizId){
    let userQuiz = getUserQuizDoc(uid, quizId);
    return (await userQuiz.get()).data()
}

function hasExpired(startTime, now){
// new Date(quiz.start_date) startTime < 0? true: false;
}

function generateClaimToken(){
    return 'AB23CD';
}

const getAllQuestions = async (req, res, next) =>{ // this controller apply a specified user for a a quiz
    try{
        let query = req.body
        let questions = firestore.collection('quizes').doc(query.id).collection('questions').get();
        res.status(200).send(questions);
    }catch(error){
        res.status(400).send(error.message);
    }
}

function getFourRandomQuestions(questions, randomQuestions){
    let randomIndex = Math.floor(Math.random() * 100);
    if(randomQuestions.length <= 4){
        if(randomQuestions.contains(questions[randomIndex])){
            return getFourRandomQuestions(questions, randomQuestions);
        }
        randomQuestions.push(questions[randomIndex]);
        return getFourRandomQuestions(questions, randomQuestions);
    }
    return randomQuestions;
}

const enterQuiz = async (req, res, next) =>{ // this controller apply a specified user for a a quiz

    try{
        let query = req.body
        let userQuiz = await getUserQuizDoc(query.uid, query.quiz_id);
        let quiz = await getQuizDocFromQuizes(query.quiz_id);

        if(quiz == null){
            throw{
                error:{
                    invalid_quiz: true
                }
            }
        }

        if(hasExpired(new Date(quiz.expiry_date), new Date(quiz.start_date))){
            throw {
                error:{
                    quiz_expired: true
                }
            }
        }

        let questions = quiz.data().questions;

        let quizExists =  userQuiz == null ? false : true;

        questions = getFourRandomQuestions(questions, []);

        let user = await (await getUser(query.uid)).get();

        if(!quizExists){
            if(!user.exists){
                throw {
                    error: {
                        user_not_found: true
                    }
                }
            }

            await firestore.collection('active_quizes').doc().set({
                quiz_id: query.quiz_id,
                user: User.fromDocToJson(user),
                questions: questions,
                completed: false,
                started: false,
                start_time: Date.now(),
                scored: 0,
                total_quesition: 4,
                redeemed : false,
                times_refreshed: 0,
                redeemToken_token: generateClaimToken(),
                quizWon: false,
                finished: false,
            })

            res.status(200).send({
                success: true,
                data:{
                    quize_refreshed: true,
                    questions: questions,
                    quize_id: query.quiz_id,
                }
            });
            return;
        }


        if(userQuiz.data().completed){
            throw {
                error:{
                    quiz_completed: true
                }
            }
        }

        if(userQuiz.data().refreshed > 3){
            throw {
                error:{
                    quiz_refresh_limit_exceeded: true
                }
            }
        }

      let updateState =  updateQuizById(userQuiz.id, {
            times_refreshed: userQuiz.data().refreshed + 1,
            questions: getFourRandomQuestions(questions, [])
        });

        if(!updateState){
            throw{
                error: {
                    quiz_refresh_failed: true,
                }
            }
        }

        res.status(200).send({
            success: true,
            data:{
                quize_refreshed: true,
                questions: questions,
                quize_id: query.quiz_id,
            }
        });
    }catch(error){
        res.status(400).send(error.code || error);
    }
}

const markQuizAsCompleted = async (req, res, next) =>{ // this controller apply a specified user for a a quiz
    try{
        let query = req.body;
        let userQuiz = await getUserQuizDoc(query.uid, query.quiz_id);
        let quiz = await getQuizDocFromQuizes(query.quiz_id);

        if(quiz == null){
            throw{
                error:{
                    invalid_quiz: true
                }
            }
        }

        if(hasExpired(new Date(quiz.expiry_date), new Date(quiz.start_date))){
            throw {
                error:{
                    quiz_expired: true
                }
            }
        }


        let userQuizData = userQuiz.data();
        let questions = quiz.data().questions;

        let score = 0;
        let i = 0;

        for(let answer of query.answers){
            for(let question of questions){
                if(answer.index == question.index)
                if(answer.answer.toLowerCase() == question.answer.toLowerCase()){
                 score += 1;
                }
            }
            i += 1;
        }
        
        updateQuizById(userQuiz.id, {
            completed: true,
            score: query.score,
            finished: true,
            score,
            quiz_won: score == userQuizData.total_question_per_user? true : false
        });


        res.status(200).send({
            success: true,
            data:{
                quiz_id: quiz.id
            }
        });

    }catch(error){
        res.status(400).send(error.code || error);
    }
}

const redeemQuiz = async (req, res, next) =>{ // this controller apply a specified user for a a quiz
    try{
        let data = req.body;

        let userQuiz = await getUserQuizDoc(query.uid, query.quiz_id);
        
        if(userQuiz == null){
             throw {
                error: {
                    quiz_not_found: true,
                }
            }
        }
        
        let userQuizDoc = await userQuiz.get();

        if(!userQuizDoc.exists){
            throw {
                error: {
                    quiz_not_found: true,
                }
            }
        }

        let userQuizData = userQuizDoc.data();

        if(!userQuizData.quiz_won){
            throw {
                error:{
                    quiz_not_won: true
                }
            }
        }

        if(!(userQuizData.claim_token == query.claim_token)){
            throw {
                error:{
                    incorrect_redeem_token: true
                }
            }
        }

        updateQuizById(userQuiz.id, {
            redeemed: true
        });
        
        // (await getQuizDataFromUser(query.uid, query.quiz_id,)).update({
        //     redeemed : true,
        // });

        res.status(200).send({
            success: true,
            data: {
                quiz_id: userQuiz.id
            }
        });
    }catch(error){
        res.status(400).send(error.code || error);
    }
}

const checkQuizStatus = async (req, res, next) =>{
    try{
        let query = req.body;
        let userQuiz = await getUserQuizDoc(query.uid, query.quiz_id);

        if(userQuiz == null){
            throw {
                error: {
                    quiz_not_found: true,
                }
            }
        }

        let userQuizDoc = await userQuiz.get();
        let userQuizData = userQuizDoc.data();

        if(!userQuizDoc.exists){
            throw {
                error: {
                    quize_not_found: true,
                }
            }
        }

        res.status(200).send({
            success: true,
            data:{
                score: userQuizData.score,
                redeemed: userQuizData.claim,
                completed: userQuizData.completed
            }
        });

    }catch(error){
        res.status(400).send(error.code || error);
    }
}

// const getQuizScore = async (req, res, next) =>{ // this controller apply a specified user for a a quiz
//     try{
//         let data = req.body
//         res.status(200).send(user);
//     }catch(error){
//         res.status(400).send(error.message);
//     }
// }

module.exports = {
    checkQuizStatus,
    enterQuiz,
    markQuizAsCompleted,
    redeemQuiz,
}