import React, { useState, useEffect, useMemo } from 'react';
import { getQuickImg, shuffle } from './components/utils';
import {
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    doc,
    updateDoc,
} from 'firebase/firestore';

import * as pokedex from './pokedex.json';
import './Pages.scss';
import { db } from '../firebase';
import { PokemonImage } from './components/PokemonImage';
import { Button, ButtonGroup } from 'react-bootstrap';

function TimedGame() {
    const [currentSolution, setCurrentSolution] = useState({});
    const [solutionList, setSolutionList] = useState([]);
    const [correctList, setCorrectList] = useState([]);
    const [useGen1, setGen1] = useState(false);
    const [start, setStart] = useState(false);
    const [finished, setFinished] = useState(false);
    const [time, setTime] = useState(0);
    const [displayTime, setDisplayTime] = useState(0);

    useEffect(() => {
        if (solutionList.length === 0) {
            initialize();
        }
    });

    useEffect(() => {
        let interval;
        let timeout;
        if (time > 0) {
            interval = setInterval(() => {
                const newTime = time - 1000;
                setTime(newTime);
            }, 1000);
            timeout = setTimeout(() => {
                setFinished(true);
                clearInterval(interval);
                setTime(0);
                clearTimeout(timeout);
            }, time);
        }
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [time, finished]);

    useEffect(() => {
        async function addToLeaderboard() {
            const username = localStorage.getItem('username');
            if (!username) return;
            const leaderboardEntry = {
                user: username,
                score: correctList.length,
                time: displayTime,
                gen: useGen1 ? '1' : 'all'
            };
            const rawEntries = await getDocs(
                collection(db, 'timed_leaderboard')
            );
            const previousEntries = rawEntries.docs.map((document) => {
                return {
                    id: document.id,
                    ...document.data(),
                };
            });

            const previousEntry = previousEntries.find(
                (entry) => entry.user === username && entry.time === displayTime
            );

            if (!previousEntry) {
                addDoc(collection(db, 'timed_leaderboard'), {
                    ...leaderboardEntry,
                    timestamp: serverTimestamp(),
                });
            } else if (
                previousEntry.time === leaderboardEntry.time &&
                leaderboardEntry.score > previousEntry.score
            ) {
                const docRef = doc(db, 'timed_leaderboard', previousEntry.id);
                await updateDoc(docRef, {
                    score: leaderboardEntry.score,
                });
            }
            setGen1(false)
        }
        if (finished && start) {
            addToLeaderboard();
        }
    }, [finished, start, correctList.length, displayTime, useGen1]);

    const initialize = async (useGen1) => {
        let list = Array.from(pokedex);
        if (useGen1) {
            setGen1(true);
            list = list.splice(0, 151);
        }
        const newSolutionList = shuffle(list);
        setSolutionList(newSolutionList);
        updateCurrentSolution(newSolutionList);
    };

    const updateCurrentSolution = (newSolutionList = solutionList) => {
        const pokemon = newSolutionList[0];
        getQuickImg(pokemon).then((pokeWithImg) =>
            setCurrentSolution(pokeWithImg)
        );
    };

    const handleStart = (startTime) => {
        setStart(true);
        setCorrectList([]);
        setDisplayTime(startTime / 1000);
        setTime(startTime);
    };

    const handleClick = (pokemon) => {
        if (pokemon.id === solutionList?.[0]?.id) {
            setCorrectList([pokemon, ...correctList]);
            solutionList.shift();
            setSolutionList(solutionList);
            updateCurrentSolution();
        }
    };

    const options = useMemo(() => {
        let list = Array.from(pokedex);
        if (useGen1) {
            setGen1(true);
            list = list.splice(0, 151);
        };
        let shuffledList = shuffle(list).splice(0, 3);

        if (shuffledList.find((poke) => poke.name === currentSolution.name)) {
            shuffledList = shuffle(list).splice(0, 3);
        }
        
        shuffledList.push(currentSolution);
        return shuffle(shuffledList)
    }, [currentSolution, useGen1]);

    return (
        <div className="unlimited-container">
            <strong className="message">
                Guess as many as you can before the time runs out!
            </strong>
            {solutionList.length === 0 && (
                <div>
                    Game is loading, may take a minute. Please wait/refresh.
                </div>
            )}

            {!start && solutionList.length > 0 && (
                <div>
                    <div>
                        <p>Only Gen 1:</p>
                        <div className="start-buttons btn-group">
                            <button
                                className="btn btn-outline-dark"
                                onClick={() => {
                                    initialize(true)
                                    handleStart(15000)
                                }}
                            >
                                15 seconds
                            </button>
                            <button
                                className="btn btn-outline-dark"
                                onClick={() => {                                    
                                    initialize(true)
                                    handleStart(30000)
                                }}
                            >
                                30 seconds
                            </button>
                            <button
                                className="btn btn-outline-dark"
                                onClick={() => {
                                    initialize(true)
                                    handleStart(60000)
                                }}
                            >
                                60 seconds
                            </button>
                        </div>
                    </div>
                    <div>
                        <p>All Pokemon:</p>
                        <div className="start-buttons btn-group">
                            <button
                                className="btn btn-outline-dark"
                                onClick={() => handleStart(15000)}
                            >
                                15 seconds
                            </button>
                            <button
                                className="btn btn-outline-dark"
                                onClick={() => handleStart(30000)}
                            >
                                30 seconds
                            </button>
                            <button
                                className="btn btn-outline-dark"
                                onClick={() => handleStart(60000)}
                            >
                                60 seconds
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {start && !finished
                ? solutionList.length > 0 && (
                      <div className="game-container">
                          <div>Time remaining: {time / 1000}</div>
                          <PokemonImage pokemon={currentSolution} isHint />

                          {/* <SearchBar onSubmit={handleClick} filter={{
                            ...DEFAULT_FILTER_STATE,
                            ...(useGen1 && {include: {
                                ...DEFAULT_FILTER_STATE.include,
                                generations: [1]
                            }})
                          }}/> */}

                          <ButtonGroup className="game-options">
                            {options.map(poke => 
                                <Button variant="outline-dark" onClick={() => handleClick(poke)}>
                                    {poke.name.english}
                                </Button>)
                            }
                          </ButtonGroup>
                      </div>
                  )
                : start && (
                      <div className="game-reveal">
                        <PokemonImage pokemon={currentSolution} />
                        <q>{currentSolution?.name?.english}</q>
                        <h2>Amount guessed correct: {correctList.length}!</h2>
                        {localStorage.getItem('username') === '' && (
                            <p>
                                Set a username above to keep track of your
                                score!
                            </p>
                        )}
                        <button
                            class="btn btn-outline-dark btn-sm game-reset"
                            onClick={() => {
                                initialize();
                                setFinished(false);
                                setStart(false);
                            }}
                        >
                            New game
                        </button>
                      </div>
                  )}
        </div>
    );
}

export default TimedGame;
