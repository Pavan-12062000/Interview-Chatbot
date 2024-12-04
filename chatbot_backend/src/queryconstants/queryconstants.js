class queryConstants {

    register = `insert into register (firstname, lastname, email, password, timestamp, updated_timestamp) values ($1, $2, $3, $4, now(), now())`;

    login = `select * from register where email = $1 and password = $2`;

    getSessionIds = `SELECT session_id, session_name, created_at FROM chat_sessions WHERE user_id = $1 ORDER BY created_at DESC`;

    getChatHistory = `SELECT sender, message, timestamp FROM chat_history WHERE chat_session_id = $1 ORDER BY timestamp ASC;`;

    createChatSession = `INSERT INTO chat_sessions (user_id, session_name, created_at) VALUES ($1, $2, now()) RETURNING session_id, created_at`;

    saveChatHistory = `INSERT INTO chat_history (chat_session_id, sender, message) VALUES ($1, $2, $3)`;

    deleteChatSession = `DELETE FROM chat_sessions WHERE session_id = $1`;

    renameSession = `UPDATE chat_sessions SET session_name = $1, created_at = now()  WHERE session_id = $2`;

    forgotPassword = `UPDATE register SET password = $2 WHERE email = $1 RETURNING *`;

}

module.exports = new queryConstants();