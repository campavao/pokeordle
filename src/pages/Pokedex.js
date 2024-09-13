import React, { useState, useCallback, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import { useDebounce } from 'use-debounce';
import ReactGA from 'react-ga4';

import { useLocalStorage } from './hooks/useLocalStorage';
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
    ReactGA.send({
        hitType: 'pageview',
        page: '/',
        title: 'pokedex',
    });
    const [pokemon, setPokemon] = useState(undefined);
    const [search, setSearch] = useState('');
    const [filterState, setFilterState] = useLocalStorage(
        'pokedex_filter_state',
        DEFAULT_FILTER_STATE
    );

    const pokemonOnPage = useMemo(
        () =>
            Array.from(pokedexJson).filter(
                (pokemon) =>
                    filterSuggestionsWithFilterState(pokemon, filterState) &&
                    (!search || searchWithin(pokemon.name.english, search))
            ),
        [filterState, search]
    );

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
        },
        [filterState, setFilterState]
    );

    const handleType = useCallback((search) => {
        const value = Array.isArray(search) ? search[0] : search;
        setSearch(value);
    }, []);

    const onPokemonClick = useCallback(async (pokemon) => {
        setPokemon(pokemon);
    }, []);

    const onClearPokemon = useCallback(() => {
        setPokemon(undefined);
    }, []);

    return (
        <div className="pokedex-container">
            <SearchWithFilter
                filterState={filterState}
                handleFilterChange={handleFilterChange}
                handleClick={onPokemonClick}
                onChange={handleType}
            />
            {pokemon && (
                <Modal show backdrop onHide={onClearPokemon}>
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
                        <div>Evolution: {pokemon.evolutionStage}</div>
                    </div>
                </Modal>
            )}
            <div className="pokedex-buttons">
                {debouncedPokemon.map((pokemon, index) => {
                    return (
                        <button
                            key={index}
                            className="pokedex-button"
                            onClick={() => onPokemonClick(pokemon)}
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
