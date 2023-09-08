import AsyncStorage from '@react-native-community/async-storage';
import * as Constant from "./../../../../utils/constants/constant";

export async function getAnswer(questionnairId,clientId){
    let _answers = await AsyncStorage.getItem(Constant.CTW_QUESTIONNAIRE) ;
    let _answerObject = JSON.parse(_answers) ;
    let temp = undefined;
    if(_answerObject){
        temp = _answerObject['QuestionnaireId_'+questionnairId+clientId];
    }
    return temp;
}
    
export async function saveAnswer(dict,questionnairId,clientId){

    let _answers = await AsyncStorage.getItem(Constant.CTW_QUESTIONNAIRE);
    let _existingObject = JSON.parse(_answers);
    let tempObject = {};
    if(_existingObject){
        tempObject = _existingObject;
    }      
    tempObject['QuestionnaireId_'+questionnairId+clientId]=dict;    
    let stringfy = JSON.stringify(tempObject);  
    AsyncStorage.setItem(Constant.CTW_QUESTIONNAIRE, stringfy);   
}

export async function deleteQuestionnaire(questionnairId,petId){

    let tempDict;
    let dictItem = JSON.parse(await AsyncStorage.getItem(Constant.CTW_QUESTIONNAIRE));
    if(dictItem){

        const copyDict= dictItem
        delete copyDict['QuestionnaireId_'+questionnairId+petId];
        tempDict = copyDict;
        let stringify = JSON.stringify(tempDict);
        AsyncStorage.setItem(Constant.CTW_QUESTIONNAIRE, stringify); 

    } 
    
}