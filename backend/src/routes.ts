import express, { response } from 'express';
const bodyParser = require('body-parser');

import PointController from './controllers/Pointscontrollers';
import ItemsController from './controllers/ItemsController';

const routes = express.Router();
const pointsController = new PointController();
const itemsController = new ItemsController();

routes.use(bodyParser.urlencoded({ extended: false }));
routes.use(bodyParser.json())

// Rotas
routes.get('/items', itemsController.index);

routes.post('/points', pointsController.create);
routes.get('/points', pointsController.index); // Listar com filtro por cidade, etc... 
routes.get('/points/:id', pointsController.show); // Listar ponto específico

export default routes;