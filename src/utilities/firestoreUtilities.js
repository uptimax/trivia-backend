const firebase = require('../db');

const firestore = firebase.firestore;
const auth = firebase.auth;

async function getUser(uid){
    let user = firestore.collection('users').doc(uid);
    return user;
}

async function getUserDocByEmail(email){
    let users = await firestore.collection('users').where('email', '==', email.toLowerCase()).get();
    return users.docs.length == 0? null : users.docs[0];
}

//admin utilities
async function getAdminDocByEmail(email){
    let users = await firestore.collection('admin').where('email', '==', email.toLowerCase()).get();
    return users.docs.length == 0? null : users.docs[0];
}

async function getQuizPaticipantsDocs(quiz_id){
    let participants = await firestore.collection('active_quizes').where('quiz_id', '==', quiz_id);
    return participants;
}

async function updateQuizById(quiz_id, data){
    try{
        let update = await firestore.collection('active_quizes').doc(quiz_id).update(data);
        return true;
    }catch(error){
        return false;
    }
}


module.exports = {
    getUser,
    getUserDocByEmail,
    getAdminDocByEmail,
    getQuizPaticipantsDocs,
    updateQuizById
}