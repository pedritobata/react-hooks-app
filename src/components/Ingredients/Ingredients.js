import React, { useState, useEffect, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

function Ingredients() {

  const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState();

  const [ ingredients, setIngredients ] = useState([]);

  //Por default, useEffect se ejecuta justo DESPUES de CADA RENDERIZADO Y RE-RENDERIZADO (tipo componentDidUpdate())
  //por eso hay que tener cuidado con alterar el estado dentro de esta funcion porque
  //se produciría un loop infinito!!
  //para evitar eso le mando un segundo argumento [] . El array es para especificar cuales
  //son las dependencias de esta funcion y si estas cambian entonces recien se ejecutaria el useEffect
  //AL mandar el arrya vacio hago que solo se ejecute el useEffect la primera renderizacion y no mas.
  //es decir, se comportaría como componentDidMount()
  useEffect(()=>{
    //notese que para fetch ya no mando configuracion, esto es porque es un GET por defecto
    fetch('https://react-hooks-studies.firebaseio.com/ingredients.json')
    .then(response=> response.json())
    .then(responseData => {
      const loadedIngredients = [];
      for(const key in responseData){
        loadedIngredients.push({
          id: key,
          title: responseData[key].title,
          amount: responseData[key].amount
        });
      }
      setIngredients(loadedIngredients);
    })
  }, []);//como no tenemos ningun side effect o dependencia(salvo el uso de setIngredient), esto no nos afecta y
  //podemos usar el array vacio para que no se produzca el loop infinito


  //puedo usar useEffect cuantas veces quiera
  //por ejemplo esta funcion se ejecutará en cada render
  //osea la primera vez que se cargue la pagina se ejecuta dos veces
  //una por el render inicial y otra despues de haber recibido el fetch de firebase que se ejecuta en el
  //anterior useEffect, dicho fetch es asincrono!!!
  useEffect(()=>{
    console.log('RENDERING');
  });



  const ingredientAddedHandler = ingredient => {
    setIsLoading(true);
    //implementamos una llamada a firebase para guardar la data tambien ahi
    //usaremos fecth para recordar.
    //fetch no es como axios, hay que configurar un poco el request
    //ingredients.json es el nombre que le estamos definiendo a nuestra coleccion en firebase
    fetch('https://react-hooks-studies.firebaseio.com/ingredients.json',{
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { "Content-Type" : "Application/json" }
    })
    .then(response=>{
      return response.json();
    })
    .then(responseData=>{
      setIngredients(prevIngredients => {
        return [ ...prevIngredients, { id: responseData.name, ...ingredient } ]
      });
      setIsLoading(false);
    });

   
  }

  //useCallback hace que la funcion que envuelve solo cambie cuando las
  //dependencias que les pongamos en el segundo argumento cambien.
  //en este caso la unica dependencia sería la funcion setIngredients de los hooks
  //la cual esta garantizado por React que no cambiará
  //Por esta razón podria enviar el seguindo parametro como [setIngredients] y no pasará nada
  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    setIngredients(filteredIngredients);
  },[]);


  const removeIngredientHandler = ingredientId => {
    setIsLoading(true);
    //eliminamos los ingredients de la BD
    fetch(`https://react-hooks-studies.firebaseio.com/ingredients/${ingredientId}.json`,{
      method: 'DELETE',
    })
    .then(response=>{
       //tambien los eliminamos de la memoria
      setIngredients(prevIngredients => {
        return prevIngredients.filter(ingredient => {
          return ingredient.id !== ingredientId;
        });
      });
      setIsLoading(false);
    })
    .catch(err=>{
      setError("Something went wrong!!");
      setIsLoading(false);
    });
  };

  const clearError = () => {
    setError(null);
  };


  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}

      <IngredientForm  
        onIngredientAdded={ingredientAddedHandler} 
        isLoading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList  ingredients={ingredients} onRemoveItem={removeIngredientHandler}/>
      </section>
    </div>
  );
}

export default Ingredients;
