import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
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

function TimedGame() {
    const [currentSolution, setCurrentSolution] = useState({});
    const [solutionList, setSolutionList] = useState([]);
    const [correctList, setCorrectList] = useState([]);
    const [guess, setGuess] = useState('');
    const [start, setStart] = useState(false);
    const [finished, setFinished] = useState(false);
    const [time, setTime] = useState(0);
    const [displayTime, setDisplayTime] = useState(0);
    const typeRef = React.createRef();

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
        }
        if (finished && start) {
            addToLeaderboard();
        }
    }, [finished, start, correctList.length, displayTime]);

    const initialize = async () => {
        const newSolutionList = shuffle(Array.from(pokedex));
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

    const handleClick = (e) => {
        e.preventDefault();
        typeRef.current.clear();
        if (guess) {
            const valid = Array.from(pokedex).find(
                (pokemon) =>
                    pokemon.name.english.toLowerCase() === guess.toLowerCase()
            );

            if (valid?.id === solutionList?.[0]?.id) {
                setCorrectList([valid, ...correctList]);
                solutionList.shift();
                setSolutionList(solutionList);
                updateCurrentSolution();
            }
        }
    };

    const handleType = (e) => {
        const guess = formatGuess(e);
        if (guess) setGuess(guess);
    };

    const handleTypeAhead = (e) => {
        if (e.length > 0) {
            setGuess(formatGuess(e[0]));
        }
    };

    const formatGuess = (rawGuess) => {
        return rawGuess.replace(/#[0-9]* /g, '');
    };

    return (
        <div className="unlimited-container">
            <strong className="message">
                Guess as many as you can before the time runs out! All
                Generations up to Gen 8.
            </strong>
            {solutionList.length === 0 && (
                <div>
                    Game is loading, may take a minute. Please wait/refresh.
                </div>
            )}

            {!start && solutionList.length > 0 && (
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
            )}

            {start && !finished
                ? solutionList.length > 0 && (
                      <div className="game-container">
                          <div>Time remaining: {time / 1000}</div>
                          <div
                              className="game-hint"
                              alt="game hint"
                              style={{
                                  backgroundImage: `url(${currentSolution?.img?.default})`,
                              }}
                          />

                          <form className="game-form" onSubmit={handleClick}>
                              <Typeahead
                                  id="input"
                                  role="input"
                                  className="game-input"
                                  onChange={handleTypeAhead}
                                  onInputChange={handleType}
                                  placeholder="who's that pokemon?"
                                  options={Array.from(pokedex).map(
                                      (pokemon) => {
                                          return `#${pokemon.id} ${pokemon.name.english}`;
                                      }
                                  )}
                                  ref={typeRef}
                                  selectHint={true}
                              />
                              <input
                                  type="submit"
                                  value="Guess"
                                  class="btn btn-light game-button"
                              ></input>
                          </form>
                      </div>
                  )
                : start && (
                      <div className="game-reveal">
                          <div
                              className="game-answer"
                              aria-label={currentSolution?.name?.english}
                              style={{
                                  backgroundImage: `url(${currentSolution?.img?.default})`,
                              }}
                          />
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
