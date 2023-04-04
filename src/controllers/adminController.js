'use strict'
const { ConvertCsvToJson } = require('../csvtojson_converter');
// const { query } = require('express');
const firebase = require('../db');
const { getUser, getUserDocByEmail, getAdminDocByEmail, getGameResultsByBooth, getPaticipantsByBooth, getAdminDocByUsername, Includes } = require('../utilities/firestoreUtilities');
const { validateSignupRequest, validateLoginRequest, validateAdminSignupRequest } = require('../utilities/validators');

const firestore = firebase.firestore;
const auth = firebase.auth;

async function getAllUsersDocs(){
    let users = (await firestore.collection('users').get()).docs;
    return users;
}

async function getAllQuizDocs(){
    let quizes = (await firestore.collection('quizes').get()).docs;
    return quizes;
}

// async function getUserDocByEmail(){
//     let users = await firestore.collection('users').where('email', '==', email.toLowerCase()).get();
//     return users.docs.length == 0? null : users.docs[0];
// }

async function getAdminDoc(uid){
    let user = firestore.collection('admin').doc(uid);
    return user;
}

const getAllUsers = async (req, res, next) =>{
    try{
        const query = req.body;
        const userDoc = await firestore.collection('admin').doc(query.uid).get();

        if(!(userDoc.exists)){
            throw {
                error: {
                    request_not_permitted: true
                }
            }
        }
        
        let users = await getAllUsersDocs();
        res.status(200).send(users.map(doc=> ({
            uid: doc.id,
            fullname: doc.data().fullname,
            email : doc.data().fullname,
            phonenumber: doc.data().fullname
        })));
    }catch(error){
        res.status(400).send(error.code || error);
    }
}

const getAllQuiz = async (req, res, next) =>{
    try{
        const query = req.body;
        const userDoc = await firestore.collection('admin').doc(query.uid).get();

        if(!(userDoc.exists)){
            throw {
                error: {
                    request_not_permitted: true
                }
            }
        }
        
        let quizes = await getAllQuizDocs();
        
        let docs = quizes.map(doc=> ({
            id: doc.id,
            title: doc.data().title,
            questions: doc.data().questions,
            expiry_date: doc.data().expiry_date,
            start_date: doc.data().start_date
        }));

        res.status(200).send({
            success: true,
            data: docs
        });

    }catch(error){
        res.status(400).send(error.code || error);
    }
}

const getQuizPaticipants = async (req, res, next) =>{
    try{
        const query = req.body;

        let missing_fields = {};
        let hasMissingFields = false;

        if(!Includes(query, "uid")){
            missing_fields.uid = true;
            hasMissingFields = true;
        }

        if(!Includes(query, "booth")){
            missing_fields.booth = true;
            hasMissingFields = true;
        }

        if(hasMissingFields){
            throw{
                missing_fields
            }
        }

        const userDoc = await firestore.collection('admin').doc(query.uid).get();
         
        if(!(userDoc.exists)){
            throw {
                error: {
                    request_not_permitted: true
                }
            }
        }

        let participants = await getPaticipantsByBooth(query.booth);
        let gameResults = await getGameResultsByBooth(query.booth);

        let participantsData = participants.map(doc => doc.data());
        let gameResultsData = gameResults.map(doc => doc.data());
        
        res.status(200).send({
            success: true,
            data: {
                participants: participantsData,
                gameResults: gameResultsData
            }
        });
    }catch(error){
        console.log(error);
        res.status(400).send(error);
    }
}

const getUserByEmail = async (req, res, next) =>{
    try{
        let query = req.body;
        let user = await getUserByEmail(query.email);
        res.status(200).send(users.map(doc=> doc.data));
    }catch(error){
        res.status(400).send(error.message);
    }
}

const redeemQuizByEmailAndToken = async (req, res, next) =>{
    try{
        let query = req.body;
        let user = await getUserDocByEmail(query.email);
        
        if(user == null){
            throw {
                error:{
                    user_not_found: true
                }
            }
        }

        let userQuiz = firestore.collection('active_quizes').doc(user.id);
        let userQuizDoc = await userQuiz.get();
        let userQuizData = userQuizDoc.data();

        if(!(userQuizDoc.exists)){
            throw {
                error:{
                    quiz_not_found: true
                }
            }
        }

        if(query.claim_token !=  userQuizData.claim_token){
            throw {
                error: {
                    invalid_claim_token: true
                }
            }
        }

        userQuiz.update({
            claimed: true
        });


        res.status(200).send({
            success: true
        });

    }catch(error){
        res.status(400).send(error.code || error);
    }
}

//admin authentication

const adminLogin = async (req, res, next) =>{
    try{
        const query = req.body;
        let validationResult = validateLoginRequest(query);

        if( validationResult != null){
            throw validationResult;
        }
    
       let user = await getAdminDocByUsername(query.username.toLowerCase());

       if(user == null){
           throw {
               error: {
                   invalid_user: true
                }
            }
        }

    const userData = user.data();

       if(userData.username.toLowerCase() != query.username.toLowerCase())
       throw {
        error: {
            incorrect_username: true
        }
       }

       if(userData.password != query.password)
       throw {
        error: {
            incorrect_password: true
        }
       }

        res.status(200).send({
            success: true,
            data: {
                uid : user.id,
                email: userData.email,
                username: userData.username,
                booth: userData.booth
            }
        });
    }catch(error){
        console.log(error);
        res.status(400).send(error);
    }
}

const adminSignup = async (req, res, next) =>{
    try{
        const query = req.body;

        // let validationResult = validateAdminSignupRequest(query);
        // if( validationResult != null){
        //     throw validationResult;
        // }
        
        let userDoc = (await getAdminDocByEmail(query.email));

           if(userDoc != null){
               throw {
                   error: {
                       user_exists: true
                   }
               }
           }

       let newUser = await auth.createUser({
            email: query.email,
            password: query.password
        });

        const user = await firestore.collection('admin').doc(newUser.uid).set({
            booth: query.booth,
            email: query.email,
            password: query.password
        });

        res.status(200).send({
            success: true,
            data: {
                fullname: query.fullname,
                email: query.email,
                uid: newUser.uid
            }
        });
    }catch(error){
        res.status(400).send(error);
    }
}

const CreateGame = async (req, res, next) =>{
    try{
        const query = req.body;
        console.log(query);
       let userDoc = await (await getAdminDoc(query.uid)).get();
       console.log(userDoc);
        if(!(userDoc.exists)){
            throw {
                error: {
                    request_not_permitted: true
                }
            }
        }

        let quiz = await firestore.collection('quizes').doc().set({
            title: query.title,
            questions: query.questions,
            start_date: query.start_date,
            expiry_date: query.expiry_date,
        });

       res.status(200).send({
        success: true,
        data: {
            title: query.title,
            questions: query.questions,
            start_date: query.start_date,
            expiry_date: query.expiry_date,
        }});

    }catch(e){
        res.status(400).send(e);
    }
};

// const convertCSVtoJson = async(req, res, next) => {
//     console.log('super vegeta');
//     console.log(req.files);
//     try{
//         if(!Object.keys(req.body).includes('file')){
//             res.status(400).send({error:{file_field_not_found: true}});
//             return;
//         }
        
//         console.log('am here');
//         // res.status(200).send(req.body.file);
//         return;
//         let json = await ConvertCsvToJson(req.body.file);
//         if(json == null){
//             throw {};
//             return;
//         }

//         res.status(200).send({
//             success: true,
//             data: json
//         });
//     }catch(e){
//         console.log(e);
//         res.status(400).send({error: {some_went_wrong: true}});
//     }
// }




module.exports = {
    adminSignup,
    adminLogin,
    getAllUsers,
    getUserByEmail,
    redeemQuizByEmailAndToken,
    getQuizPaticipants,
    getAllQuiz,
    CreateGame,
    // convertCSVtoJson,
}
