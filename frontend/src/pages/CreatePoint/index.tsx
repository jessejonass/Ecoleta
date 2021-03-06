import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom';

// Api's
import api from '../../services/api';
import axios from 'axios';

// Mapa
import {Map, TileLayer, Marker} from 'react-leaflet';
import  {LeafletMouseEvent} from 'leaflet';

// Estilização
import {FiArrowLeft} from 'react-icons/fi';
import './styles.css';
import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';

//

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

  const [formaData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  })

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedFile, setSelectedFile] = useState<File>();
  // Estados

  // Refirecionamento caso sucess
  const history = useHistory();

  // Carregar items com img's da api
  useEffect(() => {
    api.get('/items')
      .then(response => {
        setItems(response.data)
    });
  }, []);

  // Carregar estados da api do IBGE
  useEffect(() => {
    // Utilização da interface: do IBGEUFresponse -> receber os valores informados na interface
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla)
        setUfs(ufInitials)
      })
  }, []);

  useEffect(() => {
    if(selectedUf === '0'){
      return;
    }

    // Interface
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome)
        setCities(cityNames)
      })
  }, [selectedUf]);

  // Receber geolocalização atual
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords;

      setInitialPosition([latitude, longitude]);
    })
  },[])

  // Alterar a uf de acordo com o elemento HTML selecionado
  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf)
  }
  
  // Alterar a uf de acordo com o elemento HTML selecionado
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city)
  }

  // PIN do mouse no mapa
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  // funciona como e.target.value usando o elemento HTML
  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {

    const {name, value} = event.target;

    setFormData({
      ...formaData,
      [name]: value
    })
  }

  function handleSelectItem(id: number) {

    // Verificando se um item está selecionado através do ID
    const alreadySelected = selectedItems.findIndex(item => item === id);

    // Remover seleção de um item
    if(alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    }else{
      setSelectedItems([...selectedItems, id]);
    }
  }

  // Envio de dados do formulário
  async function handleSubmit(event: FormEvent){
    event.preventDefault();

    const {name, email, whatsapp} = formaData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    // Part form data
    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    
    if(selectedFile){
      data.append('image', selectedFile);
    }

    await api.post('/points', data);

    alert('Ponto de coleta criado!');

    history.push('/pointcreated');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft /> Voltar para a home
        </Link>
      </header>
      
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text" 
              name="name"
              id="name"
              onChange={handleInputChange}
              required
            />
          </div>


          <div className="field">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              name="email"
              id="email"
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input 
              type="text" 
              name="whatsapp"
              id="whatsapp"
              onChange={handleInputChange}
              required
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="//osm.org/copyright">OpenStreetMap</a> contributors'
              url="//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field">
            <label htmlFor="uf">Estado (UF)</label>
            <select 
              name="uf" 
              id="uf"
              value={selectedUf}
              onChange={handleSelectUf}
              required
            >
              <option value="0">Selecione uma UF</option>
              {ufs.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
          
          <div className="field">
            <label htmlFor="city">Cidade</label>
            <select 
              name="city" 
              id="city"
              value={selectedCity}
              onChange={handleSelectCity}
              required
            >
              <option value="0">Selecione uma cidade</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li 
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt="Text"/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )
}

export default CreatePoint;