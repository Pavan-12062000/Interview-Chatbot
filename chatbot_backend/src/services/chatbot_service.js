const DbConnection = require('../dbconnection/dbconnection-data');
const logError = require('../utilities/errorlogger');
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
}
  
module.exports = ChatbotService;