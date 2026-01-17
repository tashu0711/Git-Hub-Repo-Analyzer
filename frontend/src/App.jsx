import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import CommitHistory from './components/CommitHistory';
import DependencyTracker from './components/DependencyTracker';
import DocGenerator from './components/DocGenerator';
import CreateDocumention from './components/CreateDocumention';

const App = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path='/' element={<Home />}/>
                <Route path='/components/DependencyTracker' element={<DependencyTracker />}/>
                <Route path='/components/CommitHistory' element={<CommitHistory />}/>
                <Route path='/components/DocGenerator' element={<DocGenerator />}/>
                <Route path='/components/CreateDocumention' element={<CreateDocumention />}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
