import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Board } from './components/Board';
import { Home } from './components/Home';
import { ThemeProvider } from './components/ThemeProvider';
import './App.css';
import './index.css'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:roomId" element={<Board />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
