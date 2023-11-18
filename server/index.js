import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import express from 'express';
import { validationResult } from 'express-validator';
import { createServer } from 'http';
import logger from 'morgan';
import { Server } from 'socket.io';

dotenv.config();

const port = process.env.PORT || 8080;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {}
});

const db = createClient({
  url: "libsql://fond-professor-monster-ninjusdev.turso.io",
  authToken: process.env.FORM_DB_TOKEN
});

app.use(logger('dev'));

// Parsing middleware for JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS form_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT,
      lastname TEXT,
      email TEXT,
      contactnumber TEXT,
      message TEXT
    )
  `);
})();

app.post('/submit', async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const formData = req.body;

    await db.execute(`
      INSERT INTO form_info (firstname, lastname, email, contactnumber, message)
      VALUES (?, ?, ?, ?, ?)
    `, [formData.firstname, formData.lastname, formData.email, formData.contactnumber, formData.message]);

    console.log('Los datos del formulario se guardaron exitosamente en la base de datos.');

    res.sendFile(process.cwd() + '/client/submitted-form.html');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para servir el formulario HTML
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

// Ruta para servir la página después de enviar el formulario
app.get('/submitted-form', (req, res) => {
  res.sendFile(process.cwd() + '/client/submitted-form.html');
});

server.listen(port, () => {
  console.log(`El servidor está en ejecución en https://localhost:${port}`);
});
