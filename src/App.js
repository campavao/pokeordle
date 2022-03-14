import { useState, useEffect } from 'react';
import DailyGame from './pages/DailyGame';
import UnlimitedGame from './pages/UnlimitedGame';
import OriginalGame from './pages/OriginalGame';
import { Instructions } from './pages/Instructions';
import logo from './images/Pokeordle.png';

import './App.scss';

function App() {
    const [viewState, setViewState] = useState(
        JSON.parse(localStorage.getItem('viewState'))
    );
    const [view, setView] = useState(viewState?.view || 'unlimited');
    const [showInstructions, setShowInstructions] = useState(
        viewState?.showInstructions || false
    );

    const updateView = (newView) => {
        setView(newView);
        localStorage.setItem(
            'viewState',
            JSON.stringify({
                ...viewState,
                view: newView,
            })
        );
    };

    useEffect(() => {
        if (!viewState) {
            const initalViewState = {
                view: 'daily',
                showInstructions: true,
            };
            localStorage.setItem('viewState', JSON.stringify(initalViewState));
            setViewState(initalViewState);
            setShowInstructions(true);
        }
    }, [viewState]);

    const handleClose = () => {
        if (viewState.showInstructions) {
            localStorage.setItem(
                'viewState',
                JSON.stringify({
                    ...viewState,
                    showInstructions: false,
                })
            );
        }
        setShowInstructions(false);
    };

    return (
        <div className="container">
            <Instructions show={showInstructions} close={() => handleClose()} />
            <img
                className="logo"
                src={logo}
                alt="pokeordle, the pokemon guessing game"
            ></img>

            <button
                className="instructions bi bi-question-circle-fill"
                onClick={() => setShowInstructions(true)}
            ></button>

            <div className="right-container">
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
        </div>
    );
}

export default App;
