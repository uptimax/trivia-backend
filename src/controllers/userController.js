'use strict'
const { query } = require('express');
const firebase = require('../db');
const User = require('../models/user');
const { getUser, getUserDocByEmail } = require('../utilities/firestoreUtilities');
const {validateLoginRequest, validateSignupRequest } = require("../utilities/validators");

const firestore = firebase.firestore;
const auth = firebase.auth;

const signup = async (req, res, next) =>{
    try{
        const query = req.body;
        const error = {};

        let validationResult = validateSignupRequest(query);
        if( validationResult != null){
            throw {
                error: validationResult
            };
        }

        let userData = (await getUserDocByEmail(query.email));
        
     console.log(userData);
     console.log('data');
        if(userData != null){
            throw {
                error: {
                    user_exists: true
                }
            }
        }

        const newUser = await auth.createUser({email: query.email, password: query.password});
        const user = await firestore.collection('users').doc(newUser.uid).set({
            fullname: query.fullname,
            phonenumber: query.phonenumber,
            email: query.email,
            password: query.password
        });
        
        res.status(200).send({
            uid: newUser.uid,
            fullname: query.fullname,
            phoneNumber: query.phoneumber,
            email: query.email,
        });
    }catch(error){
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
       
       console.log('user');
       if(user == null){
        throw {
            error: {
                user_not_found: true
            }
        }
       }

       if(user.data().password != query.password){
        throw {
            error: {
                invalid_password: true
            }
        }
       }

        // console.log(data);
        let userData = user.data();

        res.status(200).send({
            fullname: userData.fullname,
            email: userData.email,
            phonenumber: userData.phonenumber,
            uid: user.id
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