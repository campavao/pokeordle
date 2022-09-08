import { useState, useEffect, createContext } from 'react';
import UnlimitedGame from './pages/UnlimitedGame';
import PartyGame from './pages/PartyGame';
import DailyGame from './pages/DailyGame';
import TimedGame from './pages/TimedGame';
import { TimedLeaderboard } from './pages/TimedLeaderboard';
import { Instructions } from './pages/Instructions';
import logo from './images/Pokeordle.png';

import './App.scss';

export const DailyContext = createContext({ remainingGuesses: 0, guesses: [] });

function App() {
    const [viewState, setViewState] = useState(
        JSON.parse(localStorage.getItem('viewState'))
    );
    const [view, setView] = useState(viewState?.view || 'Daily');
    const [showInstructions, setShowInstructions] = useState(
        viewState?.showInstructions || false
    );
    // const [username, setUsername] = useState(
    //     localStorage.getItem('username') || ''
    // );

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
                view: 'Daily',
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

    // const saveUsername = (e) => {
    //     e.preventDefault();
    //     const username = e.target?.[0]?.value;
    //     localStorage.setItem('username', username);
    //     setUsername(username);
    // };

    return (
        <div className="container">
            <Instructions show={showInstructions} close={() => handleClose()} />
            <img
                className="logo"
                src={logo}
                alt="pokeordle, the pokemon guessing game"
            ></img>

            {/* {username === '' ? (
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
            )} */}

            <button
                className="instructions bi bi-question-circle-fill"
                onClick={() => setShowInstructions(true)}
            ></button>

            <div className="right-container">
                <ul className="select-view">
                    {/* <Button
                        displayName="Daily"
                        active={view === 'daily'}
                        viewName="daily"
                        updateView={updateView}
                    /> */}
                    <Button
                        displayName="Daily"
                        active={view === 'Daily'}
                        updateView={updateView}
                    />
                    <Button
                        displayName="Unlimited"
                        active={view === 'Unlimited'}
                        updateView={updateView}
                    />
                    {/* <Button
                        displayName="Timed"
                        active={view === 'timed'}
                        updateView={updateView}
                    />
                    <Button
                        displayName="Leaderboard"
                        active={view === 'leaderboard'}
                        updateView={updateView}
                    /> */}
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
                {(view === 'Daily' || view === 'dailyhard') && (
                    <>
                        <DailyContext.Provider
                            value={{ remainingGuesses: 0, guesses: [] }}
                        >
                            <DailyGame />
                        </DailyContext.Provider>
                    </>
                )}
                {view === 'Unlimited' && <UnlimitedGame />}
                {view === 'Timed' && <TimedGame />}
                {view === 'Party' && <PartyGame />}
                {view === 'Leaderboard' && <TimedLeaderboard />}
            </div>
        </div>
    );
}

export default App;

const Button = ({ displayName, active, updateView }) => (
    <li className={`select-view-item ${active ? 'active' : ''}`}>
        <button
            className={`select-view-item-button`}
            onClick={() => updateView(displayName)}
        >
            {displayName}
        </button>
    </li>
);
