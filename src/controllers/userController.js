'use strict'
const { query } = require('express');
const firebase = require('../db');
const User = require('../models/user');
const { getUser, getUserDocByEmail, Includes, getAdminDocByBooth } = require('../utilities/firestoreUtilities');
const {validateLoginRequest, validateSignupRequest } = require("../utilities/validators");

const firestore = firebase.firestore;
const auth = firebase.auth;

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
        
        if(userData != null){
            throw {
                error: {
                    user_exists: true
                }
            }
        }

        let adminData = (await getAdminDocByBooth(query.booth));
        
        if(adminData == null){
            throw {
                error: {
                    booth_not_available: true
                }
            }
        }
        
        const newUser = await auth.createUser({email: query.email, password: query.password});

        const user = await firestore.collection('users').doc(newUser.uid).set({
            fullname: query.fullname,
            phonenumber: query.phonenumber,
            email: query.email,
            password: query.password,
            booth: query.booth,
        });
        
        res.status(200).send({
            success: true,
            data: {uid: newUser.uid,
            fullname: query.fullname,
            phoneNumber: query.phonenumber,
            email: query.email,
            booth: query.booth,
            }
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