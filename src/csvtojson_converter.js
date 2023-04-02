const csvToJson = require("csvtojson");
const fs = require("fs");

async function ConvertCsvToJson(path){
    console.log(path);
    try{
        let json = await csvToJson().fromFile(path);
        return json;
    }catch(e){
        console.log(e);
        return null
    }
}

module.exports ={
    ConvertCsvToJson
}

// async function convertCsvToJson(filePath, outputName){
//     try{
//         let json = await csvToJson().fromFile(__dirname+'/'+ filePath);
//         console.log(json[0]['question']);
//         fs.writeFileSync(__dirname + '/../files/json/' + outputName +'.json', JSON.stringify(json), 'utf-8', (err)=>{
//             console.log(err);
//         });
//     }catch(e){
//         console.log(e);
//     }
// }
