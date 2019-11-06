import React, { useState } from 'react';

import Card from '../UI/Card';
import './IngredientForm.css';

import LoadingIndicator from '../UI/LoadingIndicator';

const IngredientForm = React.memo(props => {
  console.log("RENDERING FORM");

  //    REGLAS DE LOS HOOKS:
  //1. Los hooks solo se pueden usar en functional components o en otros hooks
  //2. Los hooks solo se pueden invocar en la ruta raiz del functional component o del hook que lo contenga,
  //es decir, no puedo invocar los hooks dentro de otra funcion interna de mi componente ni tampoco
  //dentro de un bloque , sea if, for , etc.!!!



  //useState puede recibir CUALQUIER VALOR. no solo un objeto, puede ser un string, number , array , etc!!
  //y siempre devuelve un arreglo de dos elementos
  //el primero es un snapshot del ultimo estado y el segundo es una funcion que permite actualizar el estado
  //Los estados definidos con setState se mantienen en memoria así se re-renderice el componente debido a 
  //otro estado que cambió.
  //const [inputState, setInputState ] = useState({title:'', amount:''});

  //uso varios estados
  const [enteredTitle, setEnteredTitle ] = useState('');
  const [enteredAmount, setEnteredAmount ] = useState('');

  const submitHandler = event => {
    event.preventDefault();
    props.onIngredientAdded({title: enteredTitle, amount: enteredAmount});
  };

  return (
    <section className="ingredient-form">
      <Card>
        <form onSubmit={submitHandler}>
          <div className="form-control">
            <label htmlFor="title">Name</label>
            <input type="text" id="title" 
            value={enteredTitle} 
            /* OJO :::la funcion devuelta por useState y que permite actualizar el state NO HACE MERGE del 
            estado anterior con el nuevo, sino que LO CHANCA!!!.
            Para evitar eso , usamos como argumento de esa funcion un callback que recibe el prevState
            OJO: como vamos a anidar una funcion en otra y vamos a devolver el objeto event
            evitaremos usar dicho objeto event dentro de la funcion anidada, sino ,a partir de
            la segunda vez que se dispare el evento, este objeto event ya no estará dosponible y dará error!!!
             Esto es por el closure de javasacript, la funcion anidada lockea el event y lo deja sin poder ser
             usado por un siguiente evento (en este caso, un nuevo caracter ingresado en la caja de texto)*/
            /* onChange={event => {
              const newTitle = event.target.value;
              setInputState(prevInputState => {
              return {title: newTitle, amount: prevInputState.amount };
            })}} */

            onChange={event => {
              setEnteredTitle(event.target.value);
            }}
            />
          </div>
          <div className="form-control">
            <label htmlFor="amount">Amount</label>
            <input type="number" id="amount" 
             value={enteredAmount} 
             /* onChange={event => {
              const newAmount = event.target.value; 
              setInputState(prevInputState => {
               return {amount: newAmount, title: prevInputState.title};
             })}} */

             onChange={event => {
              setEnteredAmount(event.target.value);
            }}
            />
          </div>
          <div className="ingredient-form__actions">
            <button type="submit">Add Ingredient</button>
            {/* ojo con esta forma de render condicional ..bacan!! */}
            {props.isLoading && <LoadingIndicator />}
          </div>
        </form>
      </Card>
    </section>
  );
});

export default IngredientForm;
