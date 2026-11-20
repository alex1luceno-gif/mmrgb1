$content = @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
"@
[System.IO.File]::WriteAllText('C:\Users\Lenovo\Downloads\Documents\hobbyvcode\mmrgb\src\main.tsx', $content)
Write-Host 'main.tsx written'
