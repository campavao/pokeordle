import React, { useState, useEffect, useMemo } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Guess from './components/Guess';
import TypeFilter from './components/TypeFilter';
import SearchBar from './components/SearchBar';
import {
    getIntWithinRange,
    getBaseStats,
    getImg,
    getFilter,
} from './components/utils';
import { GENERATIONS } from './constants';

import * as pokedex from './pokedex.json';
import './Pages.scss';

function UnlimitedGame() {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [viewHint, setViewHint] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [includedFilter, setIncludedFilter] = useState([]);
    const [excludedFilter, setExcludedFilter] = useState([]);
    const [genFilter, setGenFilter] = useState(null);
    const [streak, setStreak] = useState(1);
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
            setGuess('');
            const pokemonBaseTotal = getBaseStats(pokemon);
            const validBaseTotal = getBaseStats(search);
            const guess = {
                name: search.name.english,
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

            const excludedTypes = guess.types
                .filter((type) => !type.isFound)
                .map((type) => type.name);
            setExcludedFilter([...excludedFilter, ...excludedTypes]);

            const includedTypes = guess.types
                .filter((type) => type.isFound)
                .map((type) => type.name);
            setIncludedFilter([...includedFilter, ...includedTypes]);

            if (search.id === pokemon.id) {
                setViewHint(false);
                setHasWon(true);
                setExcludedFilter([]);
                setIncludedFilter([]);
                setGenFilter(null);
            }
        }
    };

    const handleFilterChange = (e) => {
        const type = e.target.outerText;
        if (includedFilter.includes(type)) {
            setIncludedFilter(
                includedFilter.filter((filter) => filter !== type)
            );
        } else {
            setIncludedFilter([...includedFilter, e.target.outerText]);
        }
    };

    const filter = useMemo(
        () => getFilter(guesses, pokemon),
        [guesses, pokemon]
    );

    return (
        <div className="unlimited-container">
            <strong className="message">
                Unlimited guesses, all Generations.
            </strong>
            {streak > 1 && <div>Current streak: {streak}</div>}
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
                        <div
                            className={`game-filter ${
                                showFilters && 'show-filter'
                            }`}
                        >
                            <GenFilterDropdown
                                onClick={setGenFilter}
                                currentGenFilter={genFilter}
                            />
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
                        <SearchBar
                            className="game-form"
                            onSubmit={handleClick}
                            filter={filter}
                            disabled={hasWon}
                        />
                        <button
                            type="button"
                            class="btn btn-outline-dark btn-sm game-hint-button"
                            onClick={() => setViewHint(!viewHint)}
                        >
                            {viewHint ? 'Hide' : 'Show'} hint
                        </button>
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

function GenFilterDropdown({ onClick, currentGenFilter }) {
    return (
        <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                Filter Generation
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {GENERATIONS.map(({ name }, index) => (
                    <Dropdown.Item
                        active={index === currentGenFilter}
                        onClick={() =>
                            onClick(index !== currentGenFilter ? index : null)
                        }
                    >
                        {name}
                    </Dropdown.Item>
                ))}
                <Dropdown.Item onClick={() => onClick(null)}>
                    Reset
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default UnlimitedGame;
