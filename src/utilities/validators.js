const { Includes } = require("./firestoreUtilities");

function isEmail(email){
    let result = email.search(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    return result > -1;
}

function isPhone(phoneNumber){
    let result = phoneNumber.search(/\+?1?\s*\(?-*\.*(\d{4})\)?\.*-*\s*(\d{3})\.*-*\s*(\d{4})$/);
    return result > -1;
}

function isName(name){
    return name.trim() != ''
}

function isPassword(password){
    let result = password.search(/(?=.*[0-9a-zA-Z]){8,}/);
    return result > -1;
}

//validators

function validateFullname(body, errorFields){
    if(Includes(body,"fullname")){
        let isValid = isName(body.fullname);
        if(!isValid){
            errorFields['fullname'] = "Invalid fullname"
        }
       }
       return errorFields;
}

function validateEmail(body, errorFields){
    if(Includes(body, 'email')){
        let isValid = isEmail(body.email);
        if(!isValid){
            errorFields['email'] = "invalid Email address"
        }
       }
       return errorFields;
}

function validatePhonenumber(body, errorFields){
    if(Includes(body,"phonenumber")){
        let isValid = isPhone(body.phonenumber);
        if(!isValid){
            errorFields['phonenumber'] = "Phone number should atleast 11 characters long"
        }
       }
       return errorFields;
}

function validatePassword(body, errorFields){
    if(Includes(body, "password")){
        let isValid = isPassword(body.password);
        if(!isValid){
            errorFields['password'] = "Password should be atleast 8 characters in length"
        }
       }
       return errorFields;
}

var validateAdminSignupRequest = (body)=>{

    let errorFields = {};//this object holds field contains invalid input, as well as it's errors
    let missingFields = {};//this object contains possible fields that myth be missing
    let hasMissingFields = false;
    let hasError = false;
 
    let keys = Object.keys(body);
    let fields = ['fullname', 'email', 'password'];
 
    var i = 0;
    
    
    for(let field of fields){
     let contains = keys.includes(field);
     if(!contains){
         hasMissingFields = true;
         missingFields[field] = true;
     }
    }

    errorFields = validateEmail(body, errorFields);
    errorFields = validatePassword(body, errorFields);
    errorFields = validateFullname(body, errorFields);


    if(Object.keys(errorFields).length > 0) hasError = true;

    let validationResult = {};
    if(hasError) validationResult['errors'] = errorFields;
    if(hasMissingFields) validationResult['missing_fields'] = missingFields;
 
    return (hasMissingFields || hasError)? validationResult : null;
 }

var validateSignupRequest = (body)=>{

    let errorFields = {};//this object holds field contains invalid input, as well as it's errors
    let missingFields = {};//this object contains possible fields that myth be missing
    let hasMissingFields = false;
    let hasError = false;
 
    let keys = Object.keys(body);
    let fields = ['fullname', 'email', 'password', 'phonenumber', 'booth'];
 
    var i = 0;
    
    
    for(let field of fields){
     let contains = keys.includes(field);
     if(!contains){
         hasMissingFields = true;
         missingFields[field] = true;
     }
    }

    errorFields = validateEmail(body, errorFields);
    errorFields = validatePassword(body, errorFields);
    errorFields = validateFullname(body, errorFields);
    errorFields = validatePhonenumber(body, errorFields);


    if(Object.keys(errorFields).length > 0) hasError = true;

    let validationResult = {};
    if(hasError) validationResult['errors'] = errorFields;
    if(hasMissingFields) validationResult['missing_fields'] = missingFields;
 
    return (hasMissingFields || hasError)? validationResult : null;
 }
var validateLoginRequest = (body)=>{

    let errorFields = {};//this object holds field contains invalid input, as well as it's errors
    let missingFields = {};//this object contains possible fields that myth be missing
    let hasMissingFields = false;
    let hasError = false;
 
    let keys = Object.keys(body);
    let fields = ['email', 'password'];
 
    var i = 0;
 
    for(let field of fields){
     let contains = keys.includes(field);
     if(!contains){
         hasMissingFields = true;
         missingFields[field] = true;
     }
    }

    errorFields = validateEmail(body, errorFields);
    errorFields = validatePassword(body, errorFields);

 
    let validationResult = {};
    if(Object.keys(errorFields).length > 0) hasError = true;
    if(hasError) validationResult['errors'] = errorFields;
    if(hasMissingFields) validationResult['missing_fields'] = missingFields;
 
    return (hasMissingFields || hasError)? validationResult : null;
 }

module.exports = {
    isEmail,
    isPassword,
    isName,
    isPhone,
    validateLoginRequest,
    validateSignupRequest,
    validateAdminSignupRequest
}