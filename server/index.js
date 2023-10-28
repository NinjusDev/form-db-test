import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import express from 'express';
import logger from 'morgan';

dotenv.config()

const port = process.env.PORT ?? 8080;

const app = express();

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html');
});

const db = createClient({
    url: "libsql://fond-professor-monster-ninjusdev.turso.io",
    authToken: process.env.FORM_DB_TOKEN
});

app.use(express.urlencoded({ extended: true }));

app.use(logger('dev'));

(async () => {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS form_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstname TEXT,
            lastname TEXT,
            email TEXT,
            contactnumber NUMBER,
            message TEXT
        );    
    `);
  
    app.get('/', (req, res) => {
        res.sendFile(process.cwd() + '/client/index.html');
    });

    app.post('/submit-form', async (req, res) => {
        const formData = req.body;

        // Insertar datos en la base de datos
        await db.execute('INSERT INTO form_info (firstname, lastname, email, contactnumber, message) VALUES (?, ?, ?, ?, ?)', 
            [formData.firstname, formData.lastname, formData.email, formData.contactnumber, formData.message]);

        res.send('Formulario enviado correctamente');
    });

    app.listen(port, () => {
        console.log(`El servidor está en ejecución en https://localhost:${port}`);
    });
})();
