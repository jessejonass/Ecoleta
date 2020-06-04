import { Request, Response } from 'express';
import knex from '../database/connection';

class ItemsController {
  async index(request: Request, response: Response) {
    const items = await knex('items').select('*');
    // const items = await knex.select('*').from('items');
  
    // URL para conseguir acessar a imagem
    // Retorna da maneira exata que o frontend precisa - serializar os dados
    const serializedItems = items.map(item => {
      return {
        id: item.id,
        title: item.title,
        image_url: `http://192.168.0.12:3333/uploads/${item.image}`
      };
    });
  
    return response.json(serializedItems);
  }
}

export default ItemsController;