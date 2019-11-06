import React, { useContext } from 'react';

import Ingredients from './components/Ingredients/Ingredients';
import Auth from './components/Auth';
import {AuthContext} from './context/auth-context';

const App = props => {
  //para poder usar el contexto , antes en las class based component teniamos que declarar
  //una variable static contextType y un componente Consumer
  //pero ahora para functional components no se puede usar eso 
  //para existe el hook useContext
  const authContext = useContext(AuthContext);

  let content = <Auth />;
  if(authContext.isAuth){
    content = <Ingredients />;
  }


  return content;
};

export default App;
