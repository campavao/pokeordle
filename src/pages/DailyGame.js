import { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Guess from './components/Guess';
import TypeList from './components/TypeList';
import { getIntWithinRange, filterSuggestions, getBaseStats } from './components/utils';

import * as pokedex from './pokedex.json';
import './App.css';

function DailyGame() {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [remainingGuesses, setRemainingGuesses] = useState(8);

    useEffect(() => {
        if (!pokemon.name) {
            const today = new Date();
            const todaysNumber = Math.floor(
                (today.getDay() * (today.getFullYear() - 2000)) /
                    today.getDate()
            );
            const index = getIntWithinRange('0.' + todaysNumber, 1, 152);
            setPokemon(pokedex[index]);

            const dailyDone = Number(localStorage.getItem('dailyDone'));
            if (dailyDone === 1) {
                setRemainingGuesses(0);
            } else if (dailyDone !== today.getDate()) {
                localStorage.clear();
            } else {
                setHasWon(localStorage.getItem('dailyDone'));
            }
        }
    }, [pokemon.name]);

    const handleClick = (e) => {
        e.preventDefault();
        setRemainingGuesses(remainingGuesses - 1);
        if (remainingGuesses - 1 === 0) {
            console.log('wiping');
            localStorage.setItem('dailyDone', 1);
            localStorage.setItem('streak', 0);
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
                    localStorage.setItem('dailyDone', new Date().getDate());
                    localStorage.setItem(
                        'streak',
                        (Number(localStorage.getItem('streak')) || 0) + 1
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

            {remainingGuesses === 0 ? (
                <h2>You lost. The Pokemon was {pokemon.name.english}.</h2>
            ) : (
                <div>Remaining guesses: {remainingGuesses}</div>
            )}

            {!hasWon && remainingGuesses > 0
                ? pokemon.name && (
                      <div className="game-container">
                          <TypeList guesses={guesses} />
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
