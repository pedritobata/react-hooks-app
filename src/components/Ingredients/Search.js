import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';

const Search = React.memo(props => {
  //artificio para aislar una prop para la cual
  //quiero que se ejecute useEffect
  const { onLoadIngredients } = props;

  const [ enteredFilter, setEnteredFilter ] = useState('');
  const inputRef = useRef();

  //useEffect se ejecutará cada vez que cambie la dependencia enteredFilter(segundo argumento)
  useEffect(()=>{
      //No queremos que se ejecute una peticion en cada caracter que se ingresa a la busqueda
      //para esto definimos que debe haber un intervalo de tiempo en el que el usuario
      //hace una pausa al escribir y ahi recien se envia el request a firebase
      //para esto comparamos el texto que se ingresó antes de que el intervalo de tiempo se cumpla 
      //(el valor de la variable enteredFilter, la cual queda lockeada por el efecto closure!!)
      //contra el valor actual de esa caja de texto (obtenido directamente del html como una ref)
      //Ademas, no queremos generar un timer con cada key stroke y saturar la memoria
      //. tenemos que limpiar el timer cada vez que ocurra una ejecucion de useEffect osea con cada key stroke
      const timer = setTimeout(()=>{
        //si el valor antes de la pausa es igual al  valor actual entonces recien llamamos a firebase
        if(enteredFilter === inputRef.current.value){
          const query = enteredFilter.length === 0 ? '' : 
                    `?orderBy="title"&equalTo="${enteredFilter}"` ;
                    //firebase permite consultas con filtro, pero hay que configurar esas reglas en firebase
          fetch('https://react-hooks-studies.firebaseio.com/ingredients.json' + query)
          .then(response=> response.json())
          .then(responseData=>{
              const loadedIngredients=[];
              for(const key in responseData){
                loadedIngredients.push({
                  id: key,
                  title: responseData[key].title,
                  amount: responseData[key].amount,
                })
              }
              //cuando recibimos esta funcion en los props esto es considerado un cambio
              //ya que una funcion a fin de cuentas es un objeto
              //por lo tanto useEffect se ejecuta e invoca a la funcion que actualiza el state en el componente padre
              //lo cual origina que se vuelva a renderizar el padre y se vuelva a mandar otra vez esta 
              //funcion como props y ahi se vuelve a ejecutar useEffect y el loop infinito inicia!!!!!
              //Para solucionar esto en el componente padre usamos useCallback() el cual lockea la funcion y la
              //proteje de ser creada nuevamente
              props.onLoadIngredients(loadedIngredients);
          })
          .catch(err=>console.log(err));
        }
      },500);
      
      //para hacer la limpieza del timer hacemos que useEffect devuelva algo ,un callback
      //este callback se ejecutará despues de cada actualizacion de las dependencias de useEffect (su 2do argumento), 
      //No despues del primer render. Ademas, si no hay dependencias (arreglo vacio []) se ejecutará el callback
      //solo al momento de unmount del componente
      return () => {
        clearTimeout(timer);
      } 

  }, [enteredFilter, onLoadIngredients]);


  return (
    <section className="search">
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          <input type="text" value={enteredFilter} 
          onChange={event=>setEnteredFilter(event.target.value)}
          ref={inputRef}/>
        </div>
      </Card>
    </section>
  );
});

export default Search;
