import { useState } from 'react'
import LoadingScreen from './components/common/LoadingScreen.jsx'
import AppRoutes from './routes/AppRoutes.jsx'

// 가이드 챗봇은 인트로에서 숨기려고 주소를 아는 AppRoutes 안에서 띄운다
// 처음 접속(새로고침) 때만 페이지가 준비될 때까지 로딩 화면이 위를 덮는다 (페이지 이동 때는 뜨지 않는다)
function App() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      <AppRoutes />
      {isLoading && <LoadingScreen onDone={() => setIsLoading(false)} />}
    </>
  )
}

export default App
