import './App.css'
import { BrowserRouter } from 'react-router-dom'
import RoutesComponent from './routes/routes'
import { SurveyProvider } from './context/SurveyContext'
import { NotificationProvider } from './context/NotificationContext'

function App() {
  return (
    // <BrowserRouter>
      <NotificationProvider>
        <SurveyProvider>
          <RoutesComponent />
        </SurveyProvider>
      </NotificationProvider>
    // </BrowserRouter>
  )
}

export default App
