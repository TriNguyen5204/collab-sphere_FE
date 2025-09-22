import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AcademicList from './pages/academic/AcademicList'
import AcademicDetail from './pages/academic/AcademicDetail'
import AcademicCreate from './pages/academic/AcademicCreate'

function App() {

  return (
   <BrowserRouter>
    <Routes>
      <Route path='/academic' element={<AcademicList />} />
      <Route path='/academic/new' element={<AcademicCreate />} />
      <Route path='/academic/:id' element={<AcademicDetail />} />
    </Routes>
   </BrowserRouter>
  )
}

export default App
