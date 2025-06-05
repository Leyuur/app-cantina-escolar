import { useState, useEffect } from 'react'
import Login from './components/pages/Login/Login'

function App() {
  const [page, setPage] = useState(null)

  useEffect(() => {
    setPage(<Login setPage={setPage} />)
  }, [])

  return (
    <>
      {page}
    </>
  )
}

export default App
