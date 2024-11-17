const { query } = require('express');
const getDbConnection = require('../dbconnection/dbconnection')
let getDbConnectionInstance = new getDbConnection();
const queryConstantsInstance = require('../queryconstants/queryconstants');
const logError = require('../utilities/errorlogger');

class DbConnection{
    async register(firstname, lastname, email, password){
        let client;
        try{
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.register;
            let params =[firstname, lastname, email, password];
            const response = await client.query(query, params);
            return response;
        }catch (error) {
            logError(error);
            throw error;
        }finally{
            if(client){
                await client.end();
            }
        }
    }

    async login(email, password){
        let client;
        try{
            client = await getDbConnectionInstance.getConnection();
            let query = queryConstantsInstance.login;
            let params =[email, password];
            const response = await client.query(query, params);
            return response.rows;
        }catch (error) {
            logError(error);
            throw error;
        }finally{
            if(client){
                await client.end();
            }
        }
    }
}

module.exports = DbConnection;