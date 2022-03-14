import React, { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Guess from './components/Guess';
import TypeFilter from './components/TypeFilter';
import {
    getIntWithinRange,
    filterSuggestions,
    getBaseStats,
    getImg,
} from './components/utils';

import * as pokedex from './pokedex.json';
import './App.scss';

function UnlimitedGame() {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [viewHint, setViewHint] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [includedFilter, setIncludedFilter] = useState([]);
    const [excludedFilter, setExcludedFilter] = useState([]);
    const typeRef = React.createRef();

    useEffect(() => {
        if (!pokemon.name) {
            initialize();
        }
    }, [pokemon.name]);

    const initialize = () => {
        setGuess('');
        setGuesses([]);
        setViewHint(false);
        const index = getIntWithinRange(Math.random(), 1, 810);
        const pokemon = pokedex[index];
        getImg(pokemon).then((updatedMon) => setPokemon(updatedMon));
    };

    const handleClick = (e) => {
        e.preventDefault();
        typeRef.current.clear();
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
                const excludedTypes = guess.types
                    .filter((type) => !type.isFound)
                    .map((type) => {
                        return type.name.toLowerCase();
                    });
                const newExcludedFilter = [...excludedFilter, ...excludedTypes];
                setExcludedFilter(newExcludedFilter);
                setIncludedFilter(
                    includedFilter.filter(
                        (filter) => !newExcludedFilter.includes(filter)
                    )
                );

                if (valid.id === pokemon.id) {
                    setViewHint(false);
                    setHasWon(true);
                    setExcludedFilter([]);
                    setIncludedFilter([]);
                }
            }
        }
    };

    const handleFilterChange = (e) => {
        const type = e.target.outerText.toLowerCase();
        if (includedFilter.includes(type)) {
            setIncludedFilter(
                includedFilter.filter((filter) => filter !== type)
            );
        } else {
            setIncludedFilter([
                ...includedFilter,
                e.target.outerText.toLowerCase(),
            ]);
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
                Unlimited guesses, all Generations up to Gen 7.
            </strong>
            {!hasWon ? (
                pokemon.name && (
                    <div className="game-container">
                        {viewHint && pokemon.img && (
                            <img
                                className="game-hint"
                                src={pokemon.img.default}
                                alt="game hint"
                            />
                        )}
                        <div className={`game-filter ${showFilters && 'show'}`}>
                            <TypeFilter
                                includedFilter={includedFilter}
                                excludedFilter={excludedFilter}
                                onClick={handleFilterChange}
                            />
                        </div>
                        <button
                            class="btn btn-link btn-sm filter-button"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Filters{' '}
                            <i
                                class={`bi bi-chevron-${
                                    showFilters ? 'up' : 'down'
                                }`}
                            ></i>
                        </button>
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
                                            809,
                                            includedFilter,
                                            excludedFilter
                                        )
                                    )
                                    .map((pokemon) => {
                                        return `#${pokemon.id} ${pokemon.name.english}`;
                                    })}
                                ref={typeRef}
                            />
                            <input
                                type="submit"
                                value="Guess"
                                class="btn btn-light game-button"
                            ></input>
                            <button
                                type="button"
                                class="btn btn-outline-dark btn-sm game-hint-button"
                                onClick={() => setViewHint(!viewHint)}
                            >
                                {viewHint ? 'Hide' : 'Show'} hint
                            </button>
                        </form>
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
                    {pokemon.img && (
                        <img
                            className="game-answer"
                            src={pokemon.img.default}
                        />
                    )}
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

export default UnlimitedGame;
