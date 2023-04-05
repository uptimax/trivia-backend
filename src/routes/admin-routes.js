const express = require('express');
const multer = require('multer');
const fs = require('fs');


const { adminLogin, adminSignup, getUserByEmail, getAllUsers, getAllQuiz, getQuizPaticipants, redeemQuizByEmailAndToken, convertCSVtoJson, CreateGame, redeemQuiz } = require('../controllers/adminController');
const { ConvertCsvToJson } = require('../csvtojson_converter');
const { firestore } = require('../db');

// const uploads = multer({dest: __dirname + '/../' + 'files/csv'});

const router = express.Router();
let i;
router.post('/signup', adminSignup);
router.post('/login', adminLogin);
router.post('/get_user_by_email', getUserByEmail);
router.post('/get_all_users', getAllUsers);
router.post('/get_all_quiz', getAllQuiz);
router.post('/redeem', redeemQuiz);
router.post('/get_quiz_participants', getQuizPaticipants);
router.post('/redeem_quiz_by_email_token', redeemQuizByEmailAndToken);
router.post('/create_new_game', CreateGame);
// router.post('/getalladmin', async (req, res)=>{
//     let admins = await firestore.collection('admin').get();
//     let text = '';
//     admins.docs.forEach(doc=>{
//         let netext = '';
//         netext += "location: " + doc.data().booth + " ";
//         netext += "username : " + doc.data().username + " ";
//         netext += "password: " + doc.data().password + " ";
//         text += netext;
//     });

//     res.status(200).send(text);
// });

// router.post('/convert_csv', uploads.single('file'), async (req, res, next)=>{
//  try{
//  if(includes(req, 'file')){
//     console.log('here');
//     if(!includes(req.file, 'path')){ //
//         res.status(400).send({error: {file_not_found: true}});
//         return;
//     }
//  }
//  console.log('super');
 
//  let json = await ConvertCsvToJson(req.file.path);

//  await fs.unlink(req.file.path, (err) => {});
//  res.status(200).send({success: true, data: json});
// }catch(err){
//     console.log(err);
//     res.status(400).send({error: {
//         something_went_wrong: true
//     }});
// }
// });

function includes(data, key) {
    return Object.keys(data).includes(key);
}

module.exports = {
    routes: router
}
