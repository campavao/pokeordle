import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getImg, shuffle } from './components/utils';

import * as pokedex from './pokedex.json';
import './Pages.scss';

function TimedGame() {
    const [solutionList, setSolutionList] = useState([]);
    const [correctList, setCorrectList] = useState([]);
    const [guess, setGuess] = useState('');
    const [start, setStart] = useState(false);
    const [finished, setFinished] = useState(false);
    const [time, setTime] = useState(0);
    const typeRef = React.createRef();

    useEffect(() => {
        if (solutionList.length === 0) {
            initialize();
        }
    }, [solutionList.length]);

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

    const initialize = async () => {
        const newSolutionList = await Promise.all(
            shuffle(Array.from(pokedex)).map((pokemon) =>
                getImg(pokemon).then((updatedMon) => updatedMon)
            )
        );
        setSolutionList(newSolutionList);
    };

    const handleStart = (startTime) => {
        setStart(true);
        setCorrectList([]);
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
                Generations up to Gen 7.
            </strong>
            {solutionList.length === 0 && (
                <div>
                    Game is loading, may take a minute. Please wait/refresh.
                </div>
            )}

            {!start && solutionList.length > 0 && (
                <div className="start-buttons">
                    <button onClick={() => handleStart(15000)}>
                        15 seconds
                    </button>
                    <button onClick={() => handleStart(30000)}>
                        30 seconds
                    </button>
                    <button onClick={() => handleStart(60000)}>
                        60 seconds
                    </button>
                </div>
            )}

            {start && !finished
                ? solutionList.length > 0 && (
                      <div className="game-container">
                          <div>Time remaining: {time / 1000}</div>
                          <img
                              className="game-hint"
                              src={solutionList?.[0]?.img?.default}
                              alt="game hint"
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
                          <img
                              className="game-answer"
                              src={solutionList?.[0]?.img?.default}
                              alt={solutionList?.[0]?.name?.english}
                          />
                          <q>{solutionList?.[0]?.name?.english}</q>
                          <h2>Amount guessed correct: {correctList.length}!</h2>
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
