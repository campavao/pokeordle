import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Guess from './components/Guess';
import TypeList from './components/TypeList';
import { filterSuggestions, getBaseStats, getImg } from './components/utils';

import * as pokedex from './pokedex.json';
import './Pages.scss';

const idList = process.env.REACT_APP_POKEMON_DAILY_LIST.split(', ');

function DailyGame() {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [remainingGuesses, setRemainingGuesses] = useState(8);
    const [currStreak, setCurrStreak] = useState(0);
    const [viewHint, setViewHint] = useState(false);
    const typeRef = React.createRef();

    const getGameState = () => {
        return JSON.parse(localStorage.getItem('gameState'));
    };

    const setGameState = (gameState) => {
        localStorage.setItem('gameState', JSON.stringify(gameState));
    };

    useEffect(() => {
        if (!pokemon.name) {
            const startingDate = new Date('3/13/2022').setHours(0, 0, 0, 0);
            const today = new Date().setHours(0, 0, 0, 0);
            const todaysNumber = Math.round((today - startingDate) / 865e5);
            const index = idList[todaysNumber.toFixed()]
                ? Number(idList[todaysNumber])
                : 0;
            const solution = Array.from(pokedex).find(
                (poke) => poke.id === index
            );
            getImg(solution).then((updatedMon) => setPokemon(updatedMon));

            const gameState = getGameState();

            if (!gameState || gameState.dailyDate !== new Date().getDate()) {
                const legacyStreak = localStorage.getItem('streak');
                const streak = legacyStreak
                    ? Number(legacyStreak)
                    : !gameState
                    ? 0
                    : gameState.streak;

                if (legacyStreak) {
                    localStorage.removeItem('streak');
                }

                setCurrStreak(streak);
                setGameState({
                    dailyWon: false,
                    dailyDate: new Date().getDate(),
                    numGuessesLeft: 8,
                    streak: streak,
                    guesses: [],
                });
            } else {
                setHasWon(gameState.dailyWon);
                setRemainingGuesses(gameState.numGuessesLeft);
                setCurrStreak(gameState.streak);
                setGuesses(gameState.guesses);
            }
        }
    }, [pokemon.name]);

    const handleClick = (e) => {
        e.preventDefault();
        typeRef.current.clear();
        let newGuesses = [];
        let newHasWon = false;

        if (guess) {
            const valid = Array.from(pokedex).find(
                (pokemon) =>
                    pokemon.name.english.toLowerCase() === guess.toLowerCase()
            );

            if (valid) {
                const pokemonBaseTotal = getBaseStats(pokemon);
                const validBaseTotal = getBaseStats(valid);
                const guess = {
                    name: valid.name.english,
                    index: {
                        id: valid.id,
                        difference: pokemon.id - valid.id,
                    },
                    types: valid.types.map((typing, index) => {
                        return {
                            name: typing,
                            isFound: pokemon.types.includes(typing),
                            isSameIndex:
                                pokemon.types.indexOf(typing) === index,
                        };
                    }),
                    baseTotal: {
                        total: validBaseTotal,
                        difference: pokemonBaseTotal - validBaseTotal,
                    },
                };
                newGuesses = [guess, ...guesses];
                setGuesses(newGuesses);

                if (valid.id === pokemon.id) {
                    const previousGameState = JSON.parse(
                        localStorage.getItem('gameState')
                    );
                    const streak = (Number(previousGameState.streak) || 0) + 1;
                    setCurrStreak(streak);
                    setGameState({
                        dailyWon: true,
                        dailyDate: new Date().getDate(),
                        numGuessesLeft: remainingGuesses,
                        streak: streak,
                        guesses: guesses,
                    });
                    setHasWon(true);
                    newHasWon = true;
                }
            }
        }

        setRemainingGuesses(remainingGuesses - 1);
        if (!newHasWon && remainingGuesses - 1 === 0) {
            setGameState({
                dailyWon: false,
                dailyDate: new Date().getDate(),
                numGuessesLeft: remainingGuesses,
                streak: 0,
                guesses: newGuesses,
            });
        } else {
            const gameState = getGameState();
            setGameState({
                ...gameState,
                numGuessesLeft: remainingGuesses - 1,
                guesses: newGuesses,
            });
        }
    };

    const handleType = (e) => {
        if (e) setGuess(e);
    };

    const handleTypeAhead = (e) => {
        if (e.length > 0) {
            setGuess(e[0]);
        }
    };

    return (
        <div className="daily-container">
            <strong className="message">
                New Pokemon every day, once a day. Only Gen 1.
            </strong>
            <p>Current streak: {currStreak}</p>

            {!pokemon.name && (
                <div>
                    Game is loading, may take a minute. Please wait/refresh.
                </div>
            )}

            {!hasWon && remainingGuesses === 0 ? (
                <h2>You lost. The Pokemon was {pokemon?.name?.english}.</h2>
            ) : (
                <div>Remaining guesses: {remainingGuesses}</div>
            )}

            {!hasWon && remainingGuesses > 0
                ? pokemon.name && (
                      <div className="game-container">
                          {viewHint && pokemon.img && (
                              <div
                                  className="game-hint"
                                  aria-label={pokemon?.name?.english}
                                  style={{
                                      backgroundImage: `url(${pokemon.img?.default})`,
                                  }}
                              />
                          )}
                          <TypeList
                              types={guesses.map((guess) => guess.types).flat()}
                          />
                          <form className="game-form" onSubmit={handleClick}>
                              <Typeahead
                                  id="input"
                                  role="input"
                                  className="game-input"
                                  onChange={handleTypeAhead}
                                  onInputChange={handleType}
                                  placeholder="who's that pokemon?"
                                  options={Array.from(pokedex)
                                      .filter((pokemon) =>
                                          filterSuggestions(
                                              pokemon,
                                              guesses,
                                              151
                                          )
                                      )
                                      .map((pokemon) => {
                                          return pokemon.name.english;
                                      })}
                                  ref={typeRef}
                              />
                              <input
                                  type="submit"
                                  value="Guess"
                                  className="game-button"
                              ></input>
                              {remainingGuesses < 4 && (
                                  <button
                                      type="button"
                                      class="btn btn-outline-dark btn-sm game-hint-button"
                                      onClick={() => setViewHint(!viewHint)}
                                  >
                                      {viewHint ? 'Hide' : 'Show'} hint
                                  </button>
                              )}
                          </form>
                          <div className="guesses">
                              {guesses &&
                                  guesses.map((guess) => {
                                      return (
                                          <Guess
                                              key={guess.name}
                                              guess={guess}
                                              pokemon={pokemon}
                                              showId={false}
                                              showArrows={true}
                                          />
                                      );
                                  })}
                          </div>
                      </div>
                  )
                : hasWon && (
                      <div className="game-reveal">
                          <h2>
                              You won! The Pokemon was {pokemon?.name?.english}!
                          </h2>
                          {pokemon.img && (
                              <div
                                  className="game-answer"
                                  aria-label={pokemon?.name?.english}
                                  style={{
                                      backgroundImage: `url(${pokemon.img?.default})`,
                                  }}
                              />
                          )}
                      </div>
                  )}
        </div>
    );
}

export default DailyGame;
