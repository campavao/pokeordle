import { useState, useEffect, createContext, useCallback } from 'react';
import UnlimitedGame from './pages/UnlimitedGame';
import Pokedex from './pages/Pokedex';
import PartyGame from './pages/PartyGame';
import DailyGame from './pages/DailyGame';
import TimedGame from './pages/TimedGame';
import TeraRaidBattle from './pages/TeraRaidBattle';
import { TimedLeaderboard } from './pages/TimedLeaderboard';
import { Instructions } from './pages/Instructions';
import { Login } from './pages/Login';
import ReactGA from 'react-ga4';

import './App.scss';

export const DailyContext = createContext({ remainingGuesses: 0, guesses: [] });

function App() {
    ReactGA.initialize('G-PEHMY8Z69K', { debug: true });
    ReactGA.send({
        hitType: 'pageview',
        page: '/',
        title: 'home',
    });

    const [viewState, setViewState] = useState(
        JSON.parse(localStorage.getItem('viewState'))
    );
    const [view, setView] = useState(viewState?.view || 'Daily');
    const [showInstructions, setShowInstructionsState] = useState(
        viewState?.showInstructions || false
    );
    const [showLogin, setShowLogin] = useState(false);

    const setShowInstructions = useCallback(
        (show) => {
            setShowInstructionsState(show);
            localStorage.setItem(
                'viewState',
                JSON.stringify({
                    ...viewState,
                    showInstructions: show,
                })
            );

            ReactGA.event({
                category: 'Instructions',
                action: show ? 'Show' : 'Hide',
            });
        },
        [viewState]
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
                view: 'Daily',
                showInstructions: true,
            };
            localStorage.setItem('viewState', JSON.stringify(initalViewState));
            setViewState(initalViewState);
            setShowInstructions(true);
        }
    }, [setShowInstructions, viewState]);

    const handleClose = (modal = 'instructions') => {
        switch (modal) {
            case 'instructions': {
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
                break;
            }
            case 'login': {
                setShowLogin(false);
                break;
            }
            default:
                console.error('Unknown modal type', modal);
        }
    };

    return (
        <div className="container">
            <Instructions show={showInstructions} close={() => handleClose()} />
            <Login show={showLogin} close={() => handleClose('login')} />
            <img
                className="logo"
                src={'./images/Pokeordle.png'}
                alt="pokeordle, the pokemon guessing game"
            ></img>

            <button
                className="login bi bi-door-open"
                onClick={() => setShowLogin(true)}
            ></button>

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
                    {/* <Button
                        displayName="Tera"
                        active={view === 'Tera'}
                        updateView={updateView}
                    /> */}
                    <Button
                        displayName="Pokedex"
                        active={view === 'Pokedex'}
                        updateView={updateView}
                    />
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

                    <Button
                        displayName="Timed"
                        active={view === 'timed'}
                        updateView={updateView}
                    />

                    <Button
                        displayName="Leaderboard"
                        active={view === 'leaderboard'}
                        updateView={updateView}
                    />
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
                {view === 'Pokedex' && <Pokedex />}
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
                {view === 'Tera' && <TeraRaidBattle />}
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
