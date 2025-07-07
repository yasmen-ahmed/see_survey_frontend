import './App.css'
import { BrowserRouter } from 'react-router-dom'
import RoutesComponent from './routes/routes'
import { SurveyProvider } from './context/SurveyContext'

function App() {
  return (
    // <BrowserRouter>
      <SurveyProvider>
        <RoutesComponent />
      </SurveyProvider>
    // </BrowserRouter>
  )
}

export default App
