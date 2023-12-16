import { useState, useRef, useCallback, useMemo } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { filterSuggestionsWithFilterState } from './utils';
import { DEFAULT_FILTER_STATE } from '../constants';

import * as pokedex from '../pokedex.json';

export default function SearchBar({
    onSubmit,
    onChange,
    filter = DEFAULT_FILTER_STATE,
    disabled,
}) {
    const [preventSubmit, setPreventSubmit] = useState(true);

    const typeRef = useRef();

    const getPokemonFromSearch = useCallback((search) => {
        const pokemon = Array.isArray(search) ? search[0] : search;
        return Array.from(pokedex).find(
            ({ name }) => name.english.toLowerCase() === pokemon?.toLowerCase()
        );
    }, []);

    const handleClick = (e) => {
        e.preventDefault();
        const search = typeRef.current.getInput().value;

        if (!search) {
            console.warn('no search');
        }

        typeRef.current.clear();

        const valid = getPokemonFromSearch(search);

        onSubmit({
            ...valid,
            name: valid.name.english,
        });
    };

    const handleType = (search) => {
        if (search && getPokemonFromSearch(search)) {
            setPreventSubmit(false);
        } else {
            setPreventSubmit(true);
        }
        onChange?.(search);
    };

    const options = useMemo(
        () =>
            Array.from(pokedex)
                .filter((pokemon) =>
                    filterSuggestionsWithFilterState(pokemon, filter)
                )
                .map((pokemon) => pokemon.name.english),
        [filter]
    );

    return (
        <form className="game-form" onSubmit={handleClick}>
            <Typeahead
                id="search"
                role="input"
                className="game-input"
                onChange={handleType}
                onInputChange={handleType}
                placeholder="who's that pokemon?"
                options={options}
                ref={typeRef}
            />
            <input
                type="submit"
                value="Guess"
                className="game-button"
                disabled={disabled || preventSubmit}
            ></input>
        </form>
    );
}
