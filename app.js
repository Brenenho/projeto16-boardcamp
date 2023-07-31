import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pg from "pg"

dotenv.config()

const { Pool } = pg;

const configDatabase = {
  connectionString: process.env.DATABASE_URL,
};

export const db = new Pool(configDatabase);

const app = express()
app.use(cors())
app.use(express.json())

app.post("/games", async (req, res) => {

  try {
    const { name, image, stockTotal, pricePerDay } = req.body;

    const result = await db.query(
      `INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") 
      VALUES ($1, $2, $3, $4, $5);`,
      [name, image, stockTotal, pricePerDay]
    );

    res.send(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get("/games", async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM games;`);
    res.send(result.rows);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.post("/customers", async (req, res) => {
  try {
    const { name, phone, cpf, birthday } = req.body;

    const result = await db.query(
      `INSERT INTO customers (name, phone, cpf, birthday)
      VALUES ($1, $2, $3, $4);`,
      [name, phone, cpf, birthday]
    );

    res.send(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.post("/rentals", async (req, res) => {
  try {
    const { customerId, gameId, daysRented } = req.body;

    const customer = await db.query(
      `SELECT * FROM customers WHERE id = $1;`,
      [customerId]

    );

    const game = await db.query(
      `SELECT * FROM games WHERE id = $1;`,
      [gameId]

    );

    const rentDate = new Date();
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + daysRented);

    const originalPrice = daysRented * game.rows[0].pricePerDay;
    const delayFee = 0;
    
    const result = await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
      VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]
    );


    res.send(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

const port = process.env.PORT || 5000
app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`)
})