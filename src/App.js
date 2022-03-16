import { useState, useEffect } from 'react';
import DailyGame from './pages/DailyGame';
import UnlimitedGame from './pages/UnlimitedGame';
import PartyGame from './pages/PartyGame';
import DailyHardGame from './pages/DailyHardGame';
import TimedGame from './pages/TimedGame';
import { TimedLeaderboard } from './pages/TimedLeaderboard';
import { Instructions } from './pages/Instructions';
import logo from './images/Pokeordle.png';

import './App.scss';

function App() {
    const [viewState, setViewState] = useState(
        JSON.parse(localStorage.getItem('viewState'))
    );
    const [view, setView] = useState(viewState?.view || 'daily');
    const [showInstructions, setShowInstructions] = useState(
        viewState?.showInstructions || false
    );
    const [username, setUsername] = useState(
        localStorage.getItem('username') || ''
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

    const saveUsername = (e) => {
        e.preventDefault();
        const username = e.target?.[0]?.value;
        localStorage.setItem('username', username);
        setUsername(username);
    };

    return (
        <div className="container">
            <Instructions show={showInstructions} close={() => handleClose()} />
            <img
                className="logo"
                src={logo}
                alt="pokeordle, the pokemon guessing game"
            ></img>

            {username === '' ? (
                <form onSubmit={saveUsername} style={{ paddingBottom: '20px' }}>
                    <input
                        placeholder="enter username"
                        defaultValue={localStorage.getItem('username') || ''}
                    ></input>
                    <button type="submit" className="btn btn-light btn-sm">
                        Save
                    </button>
                </form>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}
                >
                    Current username: {username}
                    <button
                        className="btn btn-link btn-sm"
                        onClick={() => setUsername('')}
                        aria-label="change username"
                    >
                        <i class="bi bi-pen" />
                    </button>
                </div>
            )}

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
                            view === 'dailyhard' ? 'active' : ''
                        }`}
                    >
                        <button
                            className={`select-view-item-button`}
                            onClick={() => updateView('dailyhard')}
                        >
                            Daily Hard
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
                            view === 'timed' ? 'active' : ''
                        }`}
                    >
                        <button
                            className={`select-view-item-button`}
                            onClick={() => updateView('timed')}
                        >
                            Timed
                        </button>
                    </li>
                    <li
                        className={`select-view-item ${
                            view === 'leaderboard' ? 'active' : ''
                        }`}
                    >
                        <button
                            className={`select-view-item-button`}
                            onClick={() => updateView('leaderboard')}
                        >
                            Leaderboard
                        </button>
                    </li>
                    {/* <li
                        className={`select-view-item ${
                            view === 'party' ? 'active' : ''
                        }`}
                    >
                        <button
                            className={`select-view-item-button`}
                            onClick={() => updateView('party')}
                        >
                            Party
                        </button>
                    </li> */}
                </ul>
                {view === 'daily' && <DailyGame />}
                {view === 'dailyhard' && <DailyHardGame />}
                {view === 'unlimited' && <UnlimitedGame />}
                {view === 'timed' && <TimedGame />}
                {view === 'party' && <PartyGame />}
                {view === 'leaderboard' && <TimedLeaderboard />}
            </div>
        </div>
    );
}

export default App;
