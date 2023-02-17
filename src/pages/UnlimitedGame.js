import React, { useState, useEffect } from 'react';
import Guess from './components/Guess';
import { FilterContainer } from './components/TypeFilter';
import SearchBar from './components/SearchBar';
import {
    getIntWithinRange,
    getBaseStats,
    getImg,
    getFilterFromGuess,
    mergeFilterStates,
} from './components/utils';
import { DEFAULT_FILTER_STATE } from './constants';

import * as pokedex from './pokedex.json';
import './Pages.scss';

function UnlimitedGame() {
    const [pokemon, setPokemon] = useState({});
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [viewHint, setViewHint] = useState(false);
    const [streak, setStreak] = useState(1);
    const [filterState, setFilterState] = useState(DEFAULT_FILTER_STATE);

    useEffect(() => {
        if (!pokemon.name) {
            initialize();
        }
    }, [pokemon.name]);

    const initialize = () => {
        setGuesses([]);
        setViewHint(false);
        const index = getIntWithinRange(Math.random(), 1, 906);
        const pokemon = pokedex[index];
        if (pokemon.imgUrl) {
            setPokemon(pokemon);
        } else {
            getImg(pokemon).then((updatedMon) => setPokemon(updatedMon));
        }
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
                imgUrl: search.imgUrl,
            };
            setGuesses([guess, ...guesses]);

            const updatedFilterState = getFilterFromGuess(guess, pokemon);
            const newFilterState = mergeFilterStates(
                filterState,
                updatedFilterState
            );

            setFilterState(newFilterState);

            if (search.id === pokemon.id) {
                setViewHint(false);
                setHasWon(true);
                setFilterState(DEFAULT_FILTER_STATE);
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
            {!hasWon ? (
                pokemon.name && (
                    <div className="game-container">
                        {viewHint && (
                            <div
                                className="game-hint"
                                alt="game hint"
                                style={{
                                    backgroundImage: `url(${
                                        pokemon.imgUrl ?? pokemon.img?.default
                                    })`,
                                }}
                            />
                        )}
                        <div className="top-row">
                            <FilterContainer
                                filterState={filterState}
                                updateFilterState={handleFilterChange}
                            />
                            <SearchBar
                                className="game-form"
                                onSubmit={handleClick}
                                filter={filterState}
                                disabled={hasWon}
                            />
                            <button
                                type="button"
                                class="btn btn-outline-dark btn-sm game-hint-button"
                                onClick={() => setViewHint(!viewHint)}
                            >
                                {viewHint ? 'Hide' : 'Show'} hint
                            </button>
                        </div>
                        {streak > 1 && <div>Current streak: {streak}</div>}

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
                    <h2>You won! The Pokemon was {pokemon.name.english}!</h2>
                    {streak > 1 && <div>Current streak: {streak}</div>}

                    {pokemon.img && (
                        <div
                            className="game-answer"
                            aria-label={pokemon?.name?.english}
                            style={{
                                backgroundImage: `url(${pokemon.img?.default})`,
                            }}
                        />
                    )}
                    <button
                        class="btn btn-outline-dark btn-sm game-reset"
                        onClick={() => {
                            setHasWon(false);
                            setStreak(streak + 1);
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
