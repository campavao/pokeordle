import { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Guess from './components/Guess';
import TypeList from './components/TypeList';
import { filterSuggestions, getBaseStats } from './components/utils';

import * as pokedex from './pokedex.json';
import './App.css';

const idList = process.env.REACT_APP_POKEMON_DAILY_LIST.split(', ');

function DailyGame() {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [remainingGuesses, setRemainingGuesses] = useState(8);
    const [currStreak, setCurrStreak] = useState(0);

    useEffect(() => {
        if (!pokemon.name) {
            const startingDate = new Date('3/13/2022').setHours(0, 0, 0, 0);
            const today = new Date().setHours(0, 0, 0, 0);
            const todaysNumber = Math.round((today - startingDate) / 865e5);
            const index = Number(idList[todaysNumber]);
            setPokemon(Array.from(pokedex).find((poke) => poke.id === index));

            const gameState = JSON.parse(localStorage.getItem('gameState'));

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

                localStorage.setItem(
                    'gameState',
                    JSON.stringify({
                        dailyWon: false,
                        dailyDate: new Date().getDate(),
                        numGuessesLeft: 8,
                        streak: streak,
                    })
                );
            } else {
                setHasWon(gameState.dailyWon);
                setRemainingGuesses(gameState.numGuessesLeft);
                setCurrStreak(gameState.streak);
            }
        }
    }, [pokemon.name]);

    const handleClick = (e) => {
        e.preventDefault();
        setRemainingGuesses(remainingGuesses - 1);
        if (remainingGuesses - 1 === 0) {
            console.log('wiping');
            localStorage.setItem(
                'gameState',
                JSON.stringify({
                    dailyWon: false,
                    dailyDate: new Date().getDate(),
                    numGuessesLeft: remainingGuesses,
                    streak: 0,
                })
            );
        }

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
                    types: valid.type.map((typing, index) => {
                        return {
                            name: typing,
                            isFound: pokemon.type.includes(typing),
                            isSameIndex: pokemon.type.indexOf(typing) === index,
                        };
                    }),
                    baseTotal: {
                        total: validBaseTotal,
                        difference: pokemonBaseTotal - validBaseTotal,
                    },
                };
                setGuesses([guess, ...guesses]);

                if (valid.id === pokemon.id) {
                    const previousGameState = JSON.parse(
                        localStorage.getItem('gameState')
                    );
                    const streak = (Number(previousGameState.streak) || 0) + 1;
                    setCurrStreak(streak);
                    localStorage.setItem(
                        'gameState',
                        JSON.stringify({
                            dailyWon: true,
                            dailyDate: new Date().getDate(),
                            numGuessesLeft: remainingGuesses - 1,
                            streak: streak,
                        })
                    );
                    setHasWon(true);
                }
            }
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

            {remainingGuesses === 0 ? (
                <h2>You lost. The Pokemon was {pokemon.name.english}.</h2>
            ) : (
                <div>Remaining guesses: {remainingGuesses}</div>
            )}

            {!hasWon && remainingGuesses > 0
                ? pokemon.name && (
                      <div className="game-container">
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
                              />
                              <input
                                  type="submit"
                                  value="Guess"
                                  className="game-button"
                              ></input>
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
                : remainingGuesses > 0 && (
                      <h2>You won! The Pokemon was {pokemon.name.english}!</h2>
                  )}
        </div>
    );
}

export default DailyGame;
