const db = require('../config/db');

module.exports = class FantasyClub{
    constructor(id, fantasyClubName, userID){
        this.id = id;
        this.fantasyClubName = fantasyClubName;
        this.userID = userID;
    }

    static async checkIfFantasyClubNameExists(fantasyClubName){
        try {
            var query =
            'SELECT fantasyclubname FROM fantasyclubs WHERE fantasyclubname=?';
            const [rows, fields] = await db.query(query, [fantasyClubName]);
            if(!rows.length)
                return false;

            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        } 
    }

    //check if user has fantasy club
    static async checkIfUserHasFclub(userID){
        try {
            var query =
            'SELECT * FROM fantasyclubs WHERE userID=?';
            const [rows, fields] = await db.query(query, [userID]);
            if(!rows.length)
                return false;

            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }         
    }

    static async getFClubByUserId(userID){
        try {
            var query =
            'SELECT * FROM fantasyclubs WHERE userID=?';
            const [rows, fields] = await db.query(query, [userID]);
            if(!rows.length)
                return false;

            return rows[0];
        }
        catch (error) {
            console.error(error);
            return false;
        }         
    }

    static async playerExistsInFClub(userID, playerID){
        var fClub, query;
        try {
            fClub = await FantasyClub.getFClubByUserId(userID); //getting user's fantasy club
            query = "SELECT * FROM fclubplayers WHERE fClubID=? AND playerID=?";
            const [rows, fields] = await db.query(query, [fClub.id, playerID]);
            if(!rows.length)
                return false;

            return true;
        } catch (error) {
            console.error(error);
            return false;            
        }
    }

    async createFantasyClub(){
        try {
            var query =
            'INSERT INTO fantasyclubs (fantasyclubname, userID) VALUES (?, ?)';
            const [rows, fields] = await db.query(query, [this.fantasyClubName, this.userID]);
            if(!rows.affectedRows)
                return false;

            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }         
    }

    static async saveFClubName(fClubID, fClubName){
        try {
            var query = "UPDATE fantasyclubs SET fantasyClubName=? WHERE id=?";
            const [rows, fields] = await db.query(query, [fClubName, fClubID]);
            if(!rows.affectedRows)
                return false;

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async addPlayerToFClub(fClubID, playerID){
        try {
            var query, player, allClubPlayers, count = {firstTeam: 0, bench: 0}, i, positions = [0, 0, 0, 0], isFull = false;
            var fclubplayer = {
                fClubID: fClubID,
                playerID: playerID,
                isFirstTeam: 1
            };

            query = "SELECT * FROM players WHERE id=?" //looking up player for player.positionID
            var [rows, fields] = await db.query(query, [playerID]);
            if(!rows.length)
                return false;
            
            player = rows[0];
            allClubPlayers = await FantasyClub.getFClubPlayers(fClubID); //getting all players from user's fantasy club

            //getting number of players in first team and bench in user's fantasy club
            for(i = 0; i < allClubPlayers.length; i++){
                positions[allClubPlayers[i].positionID - 1] += 1; //getting number of players in each position from user's fantasy club
                if(allClubPlayers[i].isFirstTeam) //if current player is in the first team
                    count.firstTeam += 1;
                else
                    count.bench += 1;
            }

            if(count.firstTeam >= 11 && count.bench >= 5) //abort if fantasy club is full (11 first + 5 bench)
                return false;

            if(count.firstTeam >= 11) //if first team is full add new player to the bench
                isFull = true;
            
            if(player.positionID === 1){ //if player is a goalkeeper
                if(positions[0] > 0) //can not add more goalkeepers to first team
                    isFull = true;
            }
            else if(player.positionID === 2){ //if player is a defender
                if(positions[1] >= 5) //can not add more defenders to first team
                    isFull = true;
            }
            else if(player.positionID === 3){ //if player is a midfielder
                if(positions[2] >= 5) //can not add more midfielders to first team
                    isFull = true;
            }
            else if(player.positionID === 4){ //if player is an attacker
                if(positions[3] >= 4) //can not add more attackers to first team
                    isFull = true;
            }

            if(isFull) //if isFull is true, first team is full, saving player to the bench
                fclubplayer.isFirstTeam = 0;

            
            query = "INSERT INTO fclubplayers (fClubID, playerID, isFirstTeam) VALUES (?, ?, ?)";
            [rows, fields] = await db.query(query, [fclubplayer.fClubID, fclubplayer.playerID, fclubplayer.isFirstTeam]);
            if(!rows.affectedRows)
                return false;
            
            return true;
        } catch (error) {
            console.error(error);
            return false;            
        }
    }

    static async deletePlayerFromFClub(userID, playerID){
        var fClub, query;
        try {
            fClub = await FantasyClub.getFClubByUserId(userID); //get user's fantasy club
            query = "DELETE FROM fclubplayers WHERE fClubID=? AND playerID=?";
            const [rows, fields] = await db.query(query, [fClub.id, playerID]);
            if(!rows.affectedRows)
                return false;

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async getFClubPlayers(fClubID){
        try {
            //query to get all players from user's fantasy club, all data from players and it's clubs included
            var query = "SELECT fclubplayers.id, fclubplayers.fClubID, fclubplayers.playerID, fclubplayers.isFirstTeam, players.name, "+
                        "players.surname, players.fileName, players.clubID, players.positionID, clubs.name AS clubName "+
                        "FROM `fclubplayers` "+
                        "JOIN players ON fclubplayers.playerID=players.id "+
                        "JOIN clubs ON players.clubID=clubs.id "+
                        "WHERE fclubplayers.fClubID=?";
            const [rows, fields] = await db.query(query, [fClubID]);
            return rows;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}