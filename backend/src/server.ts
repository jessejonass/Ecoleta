import express, { request, response } from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();

// app.use(cors(
//   // Domínio
// ));

app.use(cors());
app.use(routes);
app.use(express.json());

// Arqquivos estáticos
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(3333);