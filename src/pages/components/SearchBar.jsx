import { useState, useRef, useCallback, useMemo } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getGeneration } from './utils';

import * as pokedex from '../pokedex.json';

const DEFAULT_FILTER = {
    include: {
        pokemon: [],
        generations: [],
        types: [],
    },
    exclude: {
        pokemon: [],
        generations: [],
        types: [],
    },
};

export default function SearchBar({
    onSubmit,
    filter = DEFAULT_FILTER,
    disabled,
}) {
    const { include, exclude, amountOfTypes } = filter;

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
    };

    const filterSuggestions = useCallback(
        (pokemon) => {
            if (
                ![
                    ...Object.values(filter.include).flat(),
                    ...Object.values(filter.exclude).flat(),
                ].length
            ) {
                return true;
            }
            const generation = getGeneration(pokemon);
            const name = pokemon.name.english.toLowerCase();
            if (
                (exclude.generations.length &&
                    exclude.generations.includes(generation)) ||
                (exclude.pokemon.length && exclude.pokemon.includes(name)) ||
                exclude.types.some((type) => pokemon.types.includes(type)) ||
                (amountOfTypes && pokemon.types.length !== amountOfTypes)
            ) {
                return false;
            }

            if (
                Object.values(filter.include).flat().length === 0 ||
                ((!include.generations.length ||
                    include.generations.includes(generation)) &&
                    (!include.pokemon.length ||
                        include.pokemon.includes(name)) &&
                    (!include.types.length ||
                        include.types.every((type) =>
                            pokemon.types.includes(type)
                        )))
            ) {
                return !amountOfTypes || pokemon.types.length === amountOfTypes;
            }
        },
        [
            exclude.generations,
            exclude.pokemon,
            exclude.types,
            filter.exclude,
            filter.include,
            include.generations,
            include.pokemon,
            include.types,
            amountOfTypes,
        ]
    );

    const options = useMemo(
        () =>
            Array.from(pokedex)
                .filter(filterSuggestions)
                .map((pokemon) => pokemon.name.english),
        [filterSuggestions]
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
