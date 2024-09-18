import React, { useCallback, useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { shuffle } from './components/utils';

import './Pages.scss';

function PartyGame() {
  const [solution, setSolution] = useState([]);
  const [guess, setGuess] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [remainingTypes, setRemainingTypes] = useState([]);
  const typeRef = React.createRef();

  const initialize = useCallback(() => {
    setGuess([]);
    setGuesses([]);
    const gen1List = Array.from(pokedex).slice(0, 151);
    const newSolution = shuffle(gen1List).slice(0, 6);
    setSolution(newSolution);
    setGuess(
      newSolution.map(() => {
        return {
          name: {},
          types: [],
          base: {},
        };
      })
    );
    setRemainingTypes(
      newSolution.map((solutionPokemon) => solutionPokemon.type.flat()).flat()
    );
  }, []);

  useEffect(() => {
    if (solution.length === 0) {
      initialize();
    }
  }, [solution.length, initialize]);

  const handleClick = (e) => {
    e.preventDefault();
    typeRef.current.clear();
    const guessBoard = guess.map((guessPokemon, guessIndex) => {
      const valid = Array.from(pokedex).find(
        (pokemon) =>
          pokemon.name.english.toLowerCase() ===
          guessPokemon.name.english.toLowerCase()
      );

      if (valid) {
        return {
          ...valid,
          index: {
            isFound: solution.some(
              (solutionPokemon) => solutionPokemon.id === valid.id
            ),
            isSameIndex:
              solution.findIndex(
                (solutionPokemon) => solutionPokemon.id === valid.id
              ) === guessIndex,
          },
        };
      }
    });
    setGuesses([guessBoard, ...guesses]);

    const guessedIds = guessBoard
      .filter((guess) => guess.index.isFound)
      .map((guess) => guess.id)
      .flat();

    const newRemainingTypes = solution
      .filter((solutionPokemon) => !guessedIds.includes(solutionPokemon.id))
      .map((solutionPokemon) => solutionPokemon.type.flat())
      .flat();
    setRemainingTypes(newRemainingTypes);
    if (guessBoard.every((guessPokemon) => guessPokemon.index.isSameIndex)) {
      setHasWon(true);
    }
  };

  const handleTypeAhead = (e, index) => {
    if (!e.length) return;
    const formatPokemonName = formatGuess(e[0]);
    const newPokemon = Array.from(pokedex).find(
      (pokemon) =>
        pokemon.name.english.toLowerCase() === formatPokemonName.toLowerCase()
    );
    guess[index] = newPokemon;
    setGuess(guess);
  };

  const formatGuess = (rawGuess) => {
    return rawGuess.replace(/#[0-9]* /g, '');
  };

  const filterPartySuggestions = (pokemon, guesses, genCap) => {
    const excludeList = guesses
      .map((guessSolution) => {
        return guessSolution.filter(
          (guessPokemon) => !guessPokemon.index.isFound
        );
      })
      .flat()
      .map((flatPoke) => flatPoke.id);
    return pokemon.id <= genCap && !excludeList.includes(pokemon.id);
  };

  if (window.innerWidth < 1000) {
    return (
      <div>
        Sorry, not available for mobile yet. Please play this mode on Desktop.
      </div>
    );
  }

  return (
    <div className="party-container">
      <strong className="message">Guess the team. Only Gen 1.</strong>

      {!hasWon ? (
        solution.length && (
          <div className="game-container">
            <ul className="party-types">
              {Array.from(new Set(remainingTypes)).map((type) => (
                <li
                  key={type}
                  className={`type-list-item ${type.toLowerCase()}`}
                >
                  {type.toUpperCase()}
                </li>
              ))}
            </ul>

            <form className="game-form" onSubmit={handleClick}>
              {guess.map((pokemon, index) => {
                return (
                  <div className="party-slot">
                    <img
                      className="party-slot-sprite"
                      src={pokemon?.img}
                      alt={pokemon?.name?.english}
                    ></img>
                    <div className="party-slot-name">
                      {pokemon.name.english}
                    </div>
                    <Typeahead
                      id="input"
                      role="input"
                      className="game-input"
                      onChange={(poke) => handleTypeAhead(poke, index)}
                      placeholder={`#${index + 1}`}
                      options={Array.from(pokedex)
                        .filter((pokemon) =>
                          filterPartySuggestions(pokemon, guesses, 151)
                        )
                        .map((pokemon) => {
                          return `#${pokemon.id} ${pokemon.name.english}`;
                        })}
                      ref={typeRef}
                    />
                  </div>
                );
              })}

              <input
                type="submit"
                value="Guess"
                class="btn btn-light game-button"
              ></input>
            </form>
            <div className="party-guesses">
              {guesses &&
                guesses.map((prevGuess) => {
                  return (
                    <div className="party-guesses-row">
                      {prevGuess.map((guessPokemon) => {
                        return (
                          <div
                            className={`party-slot ${
                              guessPokemon.index.isSameIndex
                                ? 'correct'
                                : guessPokemon.index.isFound
                                ? 'almost'
                                : 'absent'
                            }-slot`}
                          >
                            <div
                              className={
                                'party-slot-sprite ' +
                                guessPokemon.name.english
                                  .toLowerCase()
                                  .replace('. ', '')
                                  .replace("'", '')
                              }
                            ></div>
                            <div className="party-slot-name">
                              {guessPokemon.name.english}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          </div>
        )
      ) : (
        <div className="game-reveal">
          <h2>You won!</h2>
          <div className="game-reveal-party">
            {solution.map((solutionPokemon) => (
              <div className={`party-slot`}>
                <div
                  className={
                    'party-slot-sprite ' +
                    solutionPokemon.name.english
                      .toLowerCase()
                      .replace('. ', '')
                      .replace("'", '')
                  }
                ></div>
                <div className="party-slot-name">
                  {solutionPokemon.name.english}
                </div>
              </div>
            ))}
          </div>

          <button
            class="btn btn-outline-dark btn-sm game-reset"
            onClick={() => {
              setHasWon(false);
              initialize();
            }}
          >
            New Pokemon
          </button>
        </div>
      )}
    </div>
  );
}

export default PartyGame;
