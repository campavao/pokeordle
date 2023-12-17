import React, { useState, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDebounce } from 'use-debounce';

import {
    getBaseStats,
    filterSuggestionsWithFilterState,
    getImgNumber,
} from './components/utils';

import { DEFAULT_FILTER_STATE } from './constants';
import { SearchWithFilter } from './components/SearchWithFilter';

import * as pokedexJson from './pokedex.json';
import './Pokedex.scss';

function Pokedex() {
    const [pokemon, setPokemon] = useState(undefined);
    const [filterState, setFilterState] = useState(DEFAULT_FILTER_STATE);
    const [pokemonOnPage, setPokemonOnPage] = useState(Array.from(pokedexJson));
    const [debouncedPokemon] = useDebounce(pokemonOnPage, 1000);

    const handleFilterChange = useCallback(
        (filterChange, key) => {
            let newFilterState = {
                ...filterState,
                ...filterChange,
            };

            if (key) {
                newFilterState = {
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
                };
            }

            setFilterState(newFilterState);

            setPokemonOnPage(() =>
                Array.from(pokedexJson).filter((pokemon) =>
                    filterSuggestionsWithFilterState(pokemon, newFilterState)
                )
            );
        },
        [filterState]
    );

    const handleType = useCallback(
        (search) => {
            setPokemonOnPage(() =>
                Array.from(pokedexJson).filter(
                    (pokemon) =>
                        filterSuggestionsWithFilterState(
                            pokemon,
                            filterState
                        ) && searchWithin(pokemon.name.english, search)
                )
            );
        },
        [filterState]
    );

    return (
        <div className="pokedex-container">
            <SearchWithFilter
                filterState={filterState}
                handleFilterChange={handleFilterChange}
                handleClick={setPokemon}
                onChange={handleType}
            />
            {pokemon && (
                <Modal show backdrop onHide={() => setPokemon(undefined)}>
                    <div className="pokemodal">
                        <img
                            className="game-answer"
                            src={
                                pokemon?.imgUrl ??
                                `/images/${getImgNumber(pokemon.id)}.png`
                            }
                            alt=""
                        />
                        {pokemon.name.english}
                        <div>Types: {pokemon.types.join(', ')}</div>
                        <div>Base Stat Total: {getBaseStats(pokemon)}</div>
                    </div>
                </Modal>
            )}
            <div className="pokedex-buttons">
                {debouncedPokemon.map((pokemon, index) => {
                    return (
                        <button
                            key={index}
                            className="pokedex-button"
                            onClick={() => setPokemon(pokemon)}
                        >
                            <img
                                className="pokedex-image"
                                src={
                                    pokemon?.imgUrl ??
                                    `/images/${getImgNumber(pokemon.id)}.png`
                                }
                                loading="lazy"
                                alt=""
                            />
                            {pokemon.name.english}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default Pokedex;

const searchWithin = (toSearch = '', toFind = '') => {
    return toSearch.toLowerCase().includes(toFind.toLowerCase());
};
