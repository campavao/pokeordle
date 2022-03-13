import { useState } from 'react';
import DailyGame from './pages/DailyGame';
import UnlimitedGame from './pages/UnlimitedGame';
import OriginalGame from './pages/OriginalGame';

import './App.scss';

function App() {
    const [view, setView] = useState(
        localStorage.getItem('view') || 'unlimited'
    );

    const updateView = (newView) => {
        setView(newView);
        localStorage.setItem('view', newView);
    };

    return (
        <div className="container">
            <h1>Pokeordle</h1>
            <ul className="select-view">
                <li
                    className={`select-view-item ${
                        view === 'daily' ? 'active' : ''
                    }`}
                >
                    <button
                        className={`select-view-item-button`}
                        onClick={() => updateView('daily')}
                    >
                        Daily
                    </button>
                </li>
                <li
                    className={`select-view-item ${
                        view === 'unlimited' ? 'active' : ''
                    }`}
                >
                    <button
                        className={'select-view-item-button'}
                        onClick={() => updateView('unlimited')}
                    >
                        Unlimited
                    </button>
                </li>
                <li
                    className={`select-view-item ${
                        view === 'original' ? 'active' : ''
                    }`}
                >
                    <button
                        className={`select-view-item-button`}
                        onClick={() => updateView('original')}
                    >
                        Original
                    </button>
                </li>
            </ul>
            {view === 'daily' && <DailyGame />}
            {view === 'unlimited' && <UnlimitedGame />}
            {view === 'original' && <OriginalGame />}
        </div>
    );
}

export default App;
