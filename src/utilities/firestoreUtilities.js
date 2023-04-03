const firebase = require('../db');

const firestore = firebase.firestore;
const auth = firebase.auth;

async function getUser(uid){
    let user = firestore.collection('users').doc(uid);
    return user;
}

async function getUserQuizDocByUId(uid){
    let quizes = firestore.collection('active_quizes').where("uid", '==', uid).limit(1);
    let quizesDocs = await quizes.get();

    return quizesDocs.size == 0? null: quizesDocs.docs[0];
}

async function getUserDocByEmail(email){
    let users = await firestore.collection('users').where('email', '==', email.toLowerCase()).get();
    console.log(users.docs.length);
    return users.docs.length == 0? null : users.docs[0];
}

async function getUserDocById(uid){
    let user = await firestore.collection('users').doc(uid).get();
    return user;
}

async function getAdminDocByBooth(booth){
    let users = await firestore.collection('admin').where('booth', '==', booth.toLowerCase()).get();
    console.log(users.docs.length);
    return users.docs.length == 0? null : users.docs[0];
}

//admin utilities
async function getAdminDocByEmail(email){
    let users = await firestore.collection('admin').where('email', '==', email.toLowerCase()).get();
    return users.docs.length == 0? null : users.docs[0];
}

async function getProgramData(){
    let data = await firestore.collection('program_data').get();
    return  data.docs[0];
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

function Includes(data, key) {
    return Object.keys(data).includes(key);
}


module.exports = {
    getUser,
    getUserDocByEmail,
    getAdminDocByEmail,
    getQuizPaticipantsDocs,
    getAdminDocByBooth,
    updateQuizById,
    Includes,
    getUserDocById,
    getUserQuizDocByUId,
    getProgramData
}