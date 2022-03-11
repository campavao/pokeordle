import { useState } from 'react';
import DailyGame from './pages/DailyGame';
import UnlimitedGame from './pages/UnlimitedGame';
import OriginalGame from './pages/OriginalGame';

import './App.scss';

function App() {
    const [view, setView] = useState('unlimited');

    return (
        <div className="container">
            <h1>Pokeordle</h1>
            <ul className="select-view">
                <li
                    className={`select-view-item ${
                        view === 'daily' ? 'active' : ''
                    }`}
                    onClick={() => setView('daily')}
                >
                    Daily
                </li>
                <li
                    className={`select-view-item ${
                        view === 'unlimited' ? 'active' : ''
                    }`}
                    onClick={() => setView('unlimited')}
                >
                    Unlimited
                </li>
                <li
                    className={`select-view-item ${
                        view === 'original' ? 'active' : ''
                    }`}
                    onClick={() => setView('original')}
                >
                    Original
                </li>
            </ul>
            {view === 'daily' && <DailyGame />}
            {view === 'unlimited' && <UnlimitedGame />}
            {view === 'original' && <OriginalGame />}
        </div>
    );
}

export default App;
