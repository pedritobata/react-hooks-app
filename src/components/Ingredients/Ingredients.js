import React, { useState, useReducer, useEffect, useCallback, useMemo } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';


//podemos usar useReducer, el cual no tiene nada que ver con redux, pero funciona muy parecido!!
//creamos un reducer que luego será suscrito al useReducer
//recordar : primer argumento = state actual,  segundo = accion a realizar con su payload adicional
const ingredientReducer = (currentIngredients, action) => {
  switch(action.type){
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing=>ing.id !== action.id);
    default:
      throw new Error('Action not supported!!');
  }
}

//otro reducer para loading y error
const httpReducer = (currHttpState, action) => {
  switch(action.type){
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...currHttpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.errorMessage }
    case 'CLEAR':
      return { ...currHttpState, error: null };
    default:
       throw new Error('Mancamos!!'); 

  }
};

function Ingredients() {

  //const [ isLoading, setIsLoading ] = useState(false);
  const [ error, setError ] = useState();

  //const [ ingredients, setIngredients ] = useState([]);
  //suscribimos el reducer
  //useReducer permite definir un state inicial en el 2do argumento
  //ademas useReducer devuelve tambien un arreglo con dos elementos igual que useState
  //estado y funcion para modificarlo
  const [ userIngredients, dispatch ]  = useReducer(ingredientReducer, []);

  const [ httpState, dispatchHttp ] = useReducer(httpReducer, { loading: false, error: null });

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
      //setIngredients(loadedIngredients);
      dispatch({ type: 'SET', ingredients:  loadedIngredients});
    })
  }, []);//como no tenemos ningun side effect o dependencia(salvo el uso de setIngredient), esto no nos afecta y
  //podemos usar el array vacio para que no se produzca el loop infinito


  //puedo usar useEffect cuantas veces quiera
  //por ejemplo esta funcion se ejecutará en cada render
  //osea la primera vez que se cargue la pagina se ejecuta dos veces
  //una por el render inicial y otra despues de haber recibido el fetch de firebase que se ejecuta en el
  //anterior useEffect, dicho fetch es asincrono!!!
  useEffect(()=>{
    console.log('RENDERING INGREDIENTS');
  });



  //Cada vez que se cambie el estado de este componente, se creará una nueva version de esta funcion
  //debido a que las funciones son objetos. y esto originará que al pasarle esta funcion a otro
  //componente (en este caso se la pasamos a IngredientForm), se rerenderice este otro componente por 
  //las puras, por ejemplo cuando se obtengan y se pinten los ingredientes desde el backend
  //para soloucionar esto uso useCallback en conjunto con el React.memo que ya tiene el componente IngredientForm
  //con lo cual ya no se renderizará extra ese componente cuando no debe
  //como esta funcion no tiene dependencias externas podemos mandar el 2do argumento vacio []
  //las unicas depdendencias que tiene son las de los hooks del reducer , pero eso no cambia porque React
  //se encarga de eso
  const ingredientAddedHandler = useCallback(ingredient => {
    //setIsLoading(true);

    dispatchHttp({ type: 'SEND' });
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
      /* setIngredients(prevIngredients => {
        return [ ...prevIngredients, { id: responseData.name, ...ingredient } ]
      }); */
      dispatch({ type: 'ADD', ingredient: { id: responseData.name, ...ingredient } });
      //setIsLoading(false);
      dispatchHttp({ type: 'RESPONSE' });
    });

   
  }, []);

  //useCallback hace que la funcion que envuelve solo cambie cuando las
  //dependencias que les pongamos en el segundo argumento cambien.
  //en este caso la unica dependencia sería la funcion setIngredients de los hooks
  //la cual esta garantizado por React que no cambiará
  //Por esta razón podria enviar el seguindo parametro como [setIngredients] y no pasará nada
  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    //setIngredients(filteredIngredients);
    dispatch({type: 'SET', ingredients: filteredIngredients});
  },[]);


  //Esta funcion se está pasando al componente IngredientList y origina que cada cambio en el componente actual
  //genere rerender en IngredientList, pero esto no debe pasar por ejemplo para cuando se pinta el spinner, ese
  //rerender está demás. 
  //Para solucionar eso usamos useCallback y un nuevo hook useMemo() el cual reemplaza a React.memo()
  const removeIngredientHandler = useCallback(ingredientId => {
    //setIsLoading(true);
    dispatchHttp({ type: 'SEND' });
    //eliminamos los ingredients de la BD
    fetch(`https://react-hooks-studies.firebaseio.com/ingredients/${ingredientId}.json`,{
      method: 'DELETE',
    })
    .then(response=>{
       //tambien los eliminamos de la memoria

      /* setIngredients(prevIngredients => {
        return prevIngredients.filter(ingredient => {
          return ingredient.id !== ingredientId;
        });
      }); */
      dispatch({ type: 'DELETE', id:  ingredientId});
      //setIsLoading(false);
      dispatchHttp({ type: 'RESPONSE' });
    })
    .catch(err=>{
      //setError("Something went wrong!!");
      //setIsLoading(false);
      dispatchHttp({ type: 'ERROR' , errorMessage: "Mancamos bien!!"});
    });
  },[]);//esta funcion no tiene dependencias externas

  const clearError = useCallback(() => {
    //setError(null);
    dispatchHttp({ type: 'CLEAR' });
  },[]);

  //useMemo recibe un callback que será ejecutado por React
  //ese callback debe devolver la data que se va a generar solo cuando cambien las dependencias
  //que le defina
  const ingredientList = useMemo(()=>{
    return <IngredientList  ingredients={userIngredients} onRemoveItem={removeIngredientHandler}/>
  }, [userIngredients, removeIngredientHandler]);//en esta caso Sí hay dependencias externas
  //y solo en estos casos debo generar nuevamente la data, pero ya no para otras cosas como cuando
  //se dispara el Spinner!!


  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}

      <IngredientForm  
        onIngredientAdded={ingredientAddedHandler} 
        isLoading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
