const db = require('../config/db');
const bcrypt = require('bcrypt');

module.exports = class User{
    constructor(id, username, email, password, role){
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    //check if username or email is already taken
    async checkIfExists(){
        try {
            var query = 
            "SELECT username FROM users WHERE username='"+this.username+"' OR email='"+this.email+"'";
            const [rows, fields] = await db.query(query);

            if(rows.length)
                return true;
            
            return false;
        }
        catch (error) {
            console.error(error);
            return error;
        }
    }

    //registering user
    async registerUser(){
        try {
            var query =
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
            const [rows, fields] = await db.query(query, [this.username, this.email, this.password, this.role]);
            if(!rows.affectedRows)
                return false;

            return true;
        }
        catch (error) {
            return error;
        }
    }

    //checking user provided credentials with stored ones
    static async checkCreds(username, password){
        try {
            var query = "SELECT username, password FROM users WHERE username='"+username+"'";
            const [rows, fields] = await db.query(query);
            
            if(!rows.length)
                return false;

            //getting hashed password from database
            var dbPass = rows[0].password;

            //comparing passwords
            if(await bcrypt.compare(password, dbPass)){
                return true;
            }else{
                return false;
            }
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    //get user information
    static async getUserData(username){
        try {
            var query =
            "SELECT id, username, email, role FROM users where username=?";
            const [rows, fields] = await db.query(query, [username]);
            var user = new User(rows[0].id, rows[0].username, rows[0].email, null, rows[0].role);
            return user;
        }
        catch (error) {
            return error;
        }
    }
}