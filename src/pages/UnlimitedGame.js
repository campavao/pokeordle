import React, { useState, useEffect } from 'react';
import Guess from './components/Guess';
import {
    getIntWithinRange,
    getBaseStats,
    getImg,
    getFilterFromGuess,
    mergeFilterStates,
} from './components/utils';
import { DEFAULT_FILTER_STATE } from './constants';
import { SearchWithFilter } from './components/SearchWithFilter';

import * as pokedex from './pokedex.json';
import './Pages.scss';
import { PokemonImage } from './components/PokemonImage';

const MAX_GUESSES = 8;

function UnlimitedGame() {
    const [pokemon, setPokemon] = useState({});
    const [guesses, setGuesses] = useState([]);
    const [isGameOver, setGameOver] = useState(false);
    const [hasWon, setHasWon] = useState(false);
    const [streak, setStreak] = useState(1);
    const [filterState, setFilterState] = useState(DEFAULT_FILTER_STATE);

    useEffect(() => {
        if (!pokemon.name) {
            initialize();
        }
    }, [pokemon.name]);

    const initialize = async () => {
        setGuesses([]);
        const index = getIntWithinRange(Math.random(), 1, 906);
        const pokemon = pokedex[index];
        const imgPokemon = await getImg(pokemon);
        setPokemon(imgPokemon);
    };

    const handleClick = (search) => {
        if (search) {
            const pokemonBaseTotal = getBaseStats(pokemon);
            const validBaseTotal = getBaseStats(search);
            const guess = {
                name: search.name,
                index: {
                    id: search.id,
                    difference: pokemon.id - search.id,
                },
                types: search.types.map((typing, index) => {
                    return {
                        name: typing,
                        isFound: pokemon.types.includes(typing),
                        isSameIndex: pokemon.types.indexOf(typing) === index,
                    };
                }),
                baseTotal: {
                    total: validBaseTotal,
                    difference: pokemonBaseTotal - validBaseTotal,
                    stats: search.base,
                },
            };
            const updatedGuesses = [guess, ...guesses];
            setGuesses(updatedGuesses);

            const updatedFilterState = getFilterFromGuess(guess, pokemon);
            const newFilterState = mergeFilterStates(
                filterState,
                updatedFilterState
            );

            setFilterState(newFilterState);

            if (
                search.id === pokemon.id ||
                MAX_GUESSES - updatedGuesses.length === 0
            ) {
                setGameOver(true);
                setFilterState(DEFAULT_FILTER_STATE);

                if (search.id === pokemon.id) {
                    setStreak(streak + 1);
                    setHasWon(true);
                } else {
                    setStreak(1);
                }
            }
        }
    };

    const handleFilterChange = (filterChange, key) => {
        setFilterState({
            ...filterState,
            ...filterChange,
            include: {
                ...filterState.include,
                [key]: filterChange.include[key],
            },
            exclude: {
                ...filterState.exclude,
                [key]: filterChange.exclude[key],
            },
        });
    };

    return (
        <div className="unlimited-container">
            {!pokemon.name && (
                <div>
                    Game is loading, may take a minute. Please wait/refresh.
                </div>
            )}
            {!isGameOver ? (
                pokemon.name && (
                    <div className="game-container">
                        {streak > 1 && <div>Current streak: {streak}</div>}
                        <SearchWithFilter
                            filterState={filterState}
                            handleFilterChange={handleFilterChange}
                            handleClick={handleClick}
                            disabled={isGameOver}
                        />
                        Remaining guesses: {MAX_GUESSES - guesses.length}
                        <div className="guesses">
                            {guesses &&
                                guesses.map((guess) => {
                                    return (
                                        <Guess
                                            key={guess.name}
                                            guess={guess}
                                            pokemon={pokemon}
                                            showArrows={true}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                )
            ) : (
                <div className="game-reveal">
                    <h2>
                        You {!hasWon ? 'lost.' : 'won!'} The Pokemon was{' '}
                        {pokemon.name.english}
                    </h2>
                    {streak > 1 && <div>Current streak: {streak}</div>}

                    <PokemonImage pokemon={pokemon} />
                    <button
                        class="btn btn-outline-dark btn-sm game-reset"
                        onClick={() => {
                            setGameOver(false);
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

export default UnlimitedGame;
