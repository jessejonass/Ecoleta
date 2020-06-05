import { Request, Response } from 'express';
import knex from '../database/connection';

class PointController {

  async index(request: Request, response: Response){
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

    // Serialização para gerar url - mobile
    const serializedPoints = points.map(point => {
      return {
        // Tudo que ja tinha em points + 
        ...point,
        image_url: `http://192.168.0.12:3333/uploads/${point.image}`
      };
    });

    // Retornando o points serializado com url
    return response.json(serializedPoints);
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

    // Serialização para gerar url - mobile
    const serializedPoint = {
      // Tudo que ja tinha em points + 
      ...point,
      image_url: `http://192.168.0.12:3333/uploads/${point.image}`
    };

    return response.json({ point: serializedPoint, items })
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
    
    // Nome da imagem definido no form
    const point = {
      image: request.file.filename,
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
  
    // Percorrer o array de items do body - multpart form
    // Remover s vírgulas
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
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