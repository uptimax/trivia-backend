'use strict'
const { query } = require('express');
const firebase = require('../db');
const User = require('../models/user');
const { getUser, getUserDocByEmail, Includes, getAdminDocByBooth, getProgramData } = require('../utilities/firestoreUtilities');
const {validateLoginRequest, validateSignupRequest } = require("../utilities/validators");

const firestore = firebase.firestore;
const auth = firebase.auth;

async function getUserQuizDoc(uid, quizeId){
    let quizes = firestore.collection('active_quizes').where("uid", '==', uid).where("quiz_id", '==', quizeId).limit(1);
    let quizesDocs = await quizes.get();

    return quizesDocs.size == 0? null: quizesDocs.docs[0];
}


const signup = async (req, res, next) =>{
    try{
        const query = req.body;
        let validationResult = validateSignupRequest(query);
        if( validationResult != null){
            throw {
                ...validationResult
            };
        }
        
        let userData = (await getUserDocByEmail(query.email));
        
        let booths = await (await getProgramData()).data().booths;
         booths = booths.map(booth => booth.toLowerCase());
        console.log();
        if(!booths.includes(query.booth.toLowerCase())){
            throw {
                error: {
                    booth_not_available: true
                }
            }
        }
        
        if(userData != null){
        let quizDoc = await getUserQuizDoc(userData.id, userData.data().email);

        if(quizDoc == null){
            res.status(200).send({
                success: true,
                data: {uid: userData.id,
                fullname: userData.data().fullname,
                phoneNumber: userData.data().phonenumber,
                email: userData.data().email,
                booth: userData.data().booth,
                }
            });
            return;
        }
        
           throw{
            error: {
                quiz_already_taken: true
            }
           }
            return;
        }
         let ref = firestore.collection("users").doc();
         const user = await firestore.collection('users').doc(ref.id).set({
            fullname: query.fullname,
            phonenumber: query.phonenumber,
            email: query.email,
            booth: query.booth,
        });
        
        res.status(200).send({
            success: true,
            data: {
            uid: ref.id,
            fullname: query.fullname,
            phoneNumber: query.phonenumber,
            email: query.email,
            booth: query.booth,
            }
        });
    }catch(error){
        console.log(error);
        res.status(400).send(error);
    }
}

const login = async (req, res, next) =>{
    try{
        const query = req.body;
        const error = {};

        let validationResult = validateLoginRequest(query);
        if( validationResult != null){
            throw validationResult;
        }

    //    let user = await auth.getUserByEmail(query.email);
       let user = await getUserDocByEmail(query.email);
       
       if(user == null){
        throw {
            errors: {
                user_not_found: true
            }
        }
       }

       if(user.data().password != query.password){
        throw {
            errors: {
                invalid_password: true
            }
        }
       }

        // console.log(data);
        let userData = user.data();

        res.status(200).send({
            success: true,
            data: {fullname: userData.fullname,
            email: userData.email,
            phonenumber: userData.phonenumber,
            uid: user.id,
            booth: userData.booth
            }
        });
    }catch(error){
        res.status(400).send(error);
    }
}

module.exports = {
    signup,
    login,
    getUser
}