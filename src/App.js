import './App.css';
import {Route, Routes} from 'react-router-dom';
import AuthScreen from './components/AuthScreen';
function App() { 
  return (
    <div className="App">   
      {/* <Routes>

      </Routes> */}
        <AuthScreen/>

    </div>
  );
}

export default App;