const DbConnection = require('../dbconnection/dbconnection-data');
const logError = require('../utilities/errorLogger');
const dbConnectionInstance = new DbConnection();
 
class ChatbotService {
    async register(req) {
        const params =  req.body.params;
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
 
    async prechat(req, resume){
        const params =  req.body;
        let response;
        const flag = params.flag;
        const session_id = params.session_id;
        const jd = params.jobDescription;
        try{
            response = await dbConnectionInstance.prechat(flag, session_id, jd, resume);
            return response;
        }catch(err){
            logError(err);
        }
    }

    async chat(req){
        const params =  req.body.params;
        let response;
        const session_id = params.session_id;
        const message = params.message;
        try{
            response = await dbConnectionInstance.chat(session_id, message);
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

    async processResume(filePath) {
        try{
            let text = await dbConnectionInstance.processResume(filePath);
            return text;
        }catch(err){
            logError(err);
        }

    }
    
    async renameSession(req){
        const params =  req.body.params;
        let response;
        const session_id = params.session_id;
        const session_name = params.session_name;
        try{
            response = await dbConnectionInstance.renameSession(session_id, session_name);
            return response;
        }catch(err){
            logError(err);
        }
    }
}
 
module.exports = ChatbotService;