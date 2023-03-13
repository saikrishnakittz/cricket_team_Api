const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbpath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server running at https://localhost:3003/`);
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const converDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseryNumber: dbObject.jersery_number,
    role: dbObject.role,
  };
};

//List of player Api

app.get("/players/", async (request, response) => {
  const getPlayerList = `SELECT * FROM cricket_team;`;
  const playerArray = await db.all(getPlayerList);
  response.send(
    playerArray.map((eachPlayer) => {
      converDbObjectToResponseObject(eachPlayer);
    })
  );
});

//API 2
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
        INSERT INTO
            cricket_team (player_name, jersey_number, role)
        VALUES
            (
                '${playerName}',
                ${jerseyNumber},
                '${role}'                
            );`;
  const player = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(converDbObjectToResponseObject(player));
});

//API 4
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
        UPDATE
            cricket_team 
        SET 
            playerName='${playerName}',
            jerseyNumber=${jerseyNumber},
            role='${role}'
        WHERE 
            player_id='${playerId}';`;
  await db.run(addPlayerQuery);
  response.send("Player Details Updated");
});

//API 5
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
module.exports = app;
