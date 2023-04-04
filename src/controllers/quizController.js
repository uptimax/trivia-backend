'use strict'
const { query } = require('express');
const firebase = require('../db');
const User = require('../models/user');
const { updateQuizById, getUserDocByEmail, getUserDocById, Includes, getUserQuizDocByUId } = require('../utilities/firestoreUtilities');

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

function hasExpired(expiry_date){
    let expiry = new Date(expiry_date);
    return expiry > Date.now();
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

async function getExpiryDate(){
    let expiry_date = await firestore.collection('program_data').doc("dhbrI21TGoBEnV3cvIu4").get();
    return expiry_date.data().expiry_date;
}

 function checkForUIField(data){
    if(!Includes(data, 'uid'))
    {
        throw {
            "missing_fields": {
                uid: true
            }
        }
    }
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

async function quizExpired(){
    let expiry_date = await getExpiryDate();
       if(hasExpired(expiry_date)){
        throw {
            error: {
               program_expired : true
            }
        }
       }
}


const checkExpiryStatus = async (req, res, next) =>{ // this controller apply a specified user for a a quiz
      try {
        checkForUIField(req.body);
        let user = await getUserDocById(req.body.uid);

        if(!user.exists){
        throw {
            errors: {
                unauthorized_user: true
            }
        }
       }

       let expiry_date = await getExpiryDate();
       console.log(expiry_date);
       let expiry_status = hasExpired(expiry_date);
       res.status(200).send({
        success: true,
        data:{
            expiry_status
        }
       })

      } catch (error) {
        console.log(error);
        res.status(400).send(error);
      }
};

    const markQuizAsCompleted = async (req, res, next) =>{ // this controller apply a specified user for a a quiz
    try{
        let query = req.body;
        let missing_fields = {};
        let hasMissingFields = false;

        if(!Includes(query, "uid")){
            missing_fields.uid = true;
            hasMissingFields = true;
        }

        if(!Includes(query, 'score')){
            missing_fields.score = true;
            hasMissingFields = true;
        }

        if(!Includes(query, 'totalquestions')){
            missing_fields.totalquestions = true;
            hasMissingFields = true;
        }

        if(hasMissingFields){
            throw{
                missing_fields
            }
        }

        var invalidTypes = {}
        let hasInvalidTypes = false;
        console.log(query.body);
        
        if((typeof query.totalquestions).toString() == 'NaN'){
            invalidTypes.totalquestions = true;
            hasInvalidTypes = true;
        }

        if((typeof query.score).toString() == 'NaN'){
            invalidTypes.score = true;
            hasInvalidTypes = true;
        }

        if(hasInvalidTypes){
            throw{
                invalidTypes
            }
        }


        let user = await getUserDocById(query.uid);

        if(!user.exists){
        throw {
            errors: {
                unauthorized_user: true
            }
        }
       }

       await quizExpired();

        let userQuiz = await getUserQuizDocByUId(query.uid);
        if(userQuiz != null){
            throw {
                error: {
                    quiz_already_completed: true,
                }
            }
        }
       
        firestore.collection('active_quizes').doc().set({
            uid: query.uid,
            user: User.fromDocToJson(user),
            booth: user.data().booth,
            score: parseInt(query.score),
            totalquestions: parseInt(query.totalquestions),
            completed: true,
            completion_date: Date.now(),
            redeemed: false
        })

        res.status(200).send({
            success: true,
        });

    }catch(error){
        console.log(error);
        res.status(400).send(error);
    }
}

const redeemQuiz = async (req, res, next) =>{ // this controller apply a specified user for a a quiz
    try{
        let data = req.body;

        let userQuiz = await getUserQuizDoc(query.uid);
        
        
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
    checkExpiryStatus,
}