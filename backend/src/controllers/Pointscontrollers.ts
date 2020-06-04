import { Request, Response } from 'express';
import knex from '../database/connection';

class PointController {
  // Listar ponto de coleta filtrado
  async index(request: Request, response: Response){
    // Cidade, UF e Items (query params)
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')

    parsedItems.map(item => Number(item.trim));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return response.json(points);
  }

  async show(request: Request, response: Response){
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if(!point){
      return response.status(400).json({ message: 'Point not found' });
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', '=', id)
      .select('items.title');

    return response.json({ point, items })
  }

  async create(request: Request, response: Response){
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;
  
    const trx = await knex.transaction();
  
    const point = {
      image: 'https://cdn.pixabay.com/photo/2012/02/28/00/39/freight-17666_960_720.jpg',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

    const insertedIds = await trx('points').insert(point);
  
    const point_id = insertedIds[0];
  
    // Percorrer o array de items do body
    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id: point_id
      }
    });
  
    // Inserir na tabela point_items os itens recebidos do body
    await trx('point_items').insert(pointItems);
    await trx.commit();
  
    return response.json({
      id: point_id,
      ...point,
    });
  }
}

export default PointController;