const DbConnection = require('../dbconnection/dbconnection-data');
const logError = require('../utilities/errorLogger');
const dbConnectionInstance = new DbConnection();  
 
class ChatbotService {
    async register(req) {
        console.log("Inside register service", req.body);
        const params =  req.body.params;
        console.log("params", params);
        let response;
            const firstname = params.firstname;
            const lastname = params.lastname;
            const email = params.email;
            const password = params.password;
            try{
                response = await dbConnectionInstance.register(firstname, lastname, email, password);
                return response;
            }catch(err){
                logError(err);
            }
    }
 
    async login(req){
        const params =  req.body.params;
        let response;
        const email = params.email;
        const password = params.password;
        try{
            response = await dbConnectionInstance.login(email, password);
            return response;
        }catch(err){
            logError(err);
        }
    }
 
    async chat(req){
        const params =  req.body.params;
        let response;
        const message = params.message;
        const flag = params.flag;
        const session_id = params.session_id;
        try{
            response = await dbConnectionInstance.chat(message, flag, session_id);
            return response;
        }catch(err){
            logError(err);
        }
    }
 
    async home(req){
        const params = JSON.parse(req.headers.params);
        let response;
        const user_id = params.user_id;
        try{
            response = await dbConnectionInstance.home(user_id);
            return response;
        }catch(err){
            logError(err);
        }
    }
 
    async chatHistory(req){
        const params = JSON.parse(req.headers.params);
        let response;
        const session_id = params.session_id;
        try{
            response = await dbConnectionInstance.chatHistory(session_id);
            return response;
        }catch(err){
            logError(err);
        }
    }
 
    async createChatSession(req){
        const params =  req.body.params;
        let response;
        const user_id = params.user_id;
        const session_name = params.session_name;
        try{
            response = await dbConnectionInstance.createChatSession(user_id, session_name);
            return response;
        }catch(err){
            logError(err);
        }
    }
 
    async deleteChatSession(req){
        const params =  req.body.params;
        let response;
        const session_id = params.session_id;
        try{
            response = await dbConnectionInstance.deleteChatSession(session_id);
            return response;
        }catch(err){
            logError(err);
        }
    }
}
 
module.exports = ChatbotService;