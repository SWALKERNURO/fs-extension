import { BrowserRouter as Router, Routes, Route } from 'react-router'
import AnecdoteProvider from './hooks/AnecdoteProvider'
import Menu from './components/Menu'
import AnecdoteList from './components/AnecdoteList'
import About from './components/About'
import Footer from './components/Footer'
import CreateNew from './components/CreateNew'
export default function App() {
  return <AnecdoteProvider><Router><main>
    <h1>Software anecdotes</h1><Menu />
    <Routes>
      <Route path="/" element={<AnecdoteList />} />
      <Route path="/create" element={<CreateNew />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<p>Page not found</p>} />
    </Routes><Footer />
  </main></Router></AnecdoteProvider>
}
