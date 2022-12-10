import React, { useState, useMemo, useCallback } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useDailyGame } from './hooks/useDailyGame';
import { filterSuggestions } from './components/utils';
import * as pokedex from './pokedex.json';

import './Pokedex.scss';
import { useEffect } from 'react';
import TypeList from './components/TypeList';

const TYPES = [
    'normal',
    'fighting',
    'flying',
    'poison',
    'ground',
    'rock',
    'bug',
    'ghost',
    'steel',
    'fire',
    'water',
    'grass',
    'electric',
    'psychic',
    'ice',
    'dragon',
    'dark',
    'fairy',
];

// interface NameAndUrl {
//     name: string;
//     url: string;
// }

// interface Type {
//     damage_relations: {
//         double_damage_from: NameAndUrl[];
//         double_damage_to: NameAndUrl[];
//         half_damage_from: NameAndUrl[];
//         half_damage_to: NameAndUrl[];
//         no_damage_from: NameAndUrl[];
//         no_damage_to: NameAndUrl[];
//     };
//     game_indices: {
//         game_index: number;
//         generation: NameAndUrl;
//     }[];
//     generation: NameAndUrl;
//     id: number;
//     move_damage_class: NameAndUrl;
//     moves: NameAndUrl[];
//     name: string;
//     names: { language: NameAndUrl; name: string }[];
//     past_damage_relations: NameAndUrl[];
//     pokemon: { pokemon: NameAndUrl; slot: number };
// }

function TeraRaidBattle() {
    const { guesses, typeRef } = useDailyGame('hardGameState');

    const [currentPokemon, setCurrentPokemon] = useState(null);
    const [currentTypes, setCurrentTypes] = useState([]);
    const [teraTypes, setTeraTypes] = useState([]);
    const type1Ref = React.createRef();
    const type2Ref = React.createRef();
    const teraRef = React.createRef();

    const updateCurrentTypes = useCallback(
        async (type, index) => {
            const data = await fetch(
                `https://pokeapi.co/api/v2/type/${type}`
            ).then((res) => res.json());
            let newTypes = [...currentTypes];
            console.log(newTypes);
            newTypes[index] = data;

            if (data) {
                setCurrentTypes(newTypes);
                type1Ref.current.clear();
                type2Ref.current.clear();
            }
        },
        [currentTypes, type1Ref, type2Ref]
    );

    const updateTypesFromPokemon = useCallback(async (types) => {
        const data = await Promise.all(
            types.map(
                async (type) =>
                    await fetch(`https://pokeapi.co/api/v2/type/${type}`).then(
                        (res) => res.json()
                    )
            )
        );

        if (data) {
            setCurrentTypes(data);
        }
    }, []);

    const updateTeraType = useCallback(
        async (type) => {
            const data = await fetch(
                `https://pokeapi.co/api/v2/type/${type}`
            ).then((res) => res.json());

            if (data) {
                setTeraTypes([data]);
                teraRef.current.clear();
            }
        },
        [teraRef]
    );

    const handleTypeUpdate = async (e, index, tera = false) => {
        if (e.length) {
            if (tera) {
                await updateTeraType(e[0]);
            } else {
                await updateCurrentTypes(e[0], index);
            }
        }
    };

    const pokemonOptions = useMemo(
        () =>
            Array.from(pokedex)
                .filter((pokemon) => filterSuggestions(pokemon, guesses, 9999))
                .map((pokemon) => {
                    return pokemon.name.english;
                }),
        [guesses]
    );

    const handlePokeType = (e) => {
        if (e.length) {
            const found = Array.from(pokedex).find(
                (poke) => poke.name.english === e[0]
            );
            if (found) {
                setCurrentTypes([]);
                setCurrentPokemon(found);
                typeRef.current.clear();
            }
        }
    };

    useEffect(() => {
        if (currentPokemon && !currentTypes.length) {
            const newTypes = currentPokemon.type.map((name) =>
                name.toLowerCase()
            );

            (async () => await updateTypesFromPokemon(newTypes))();
            type1Ref.current.clear();
            type2Ref.current.clear();
        }
    }, [
        currentPokemon,
        currentTypes,
        type1Ref,
        type2Ref,
        updateCurrentTypes,
        updateTypesFromPokemon,
    ]);

    const reset = () => {
        setCurrentPokemon(null);
        setCurrentTypes([]);
        setTeraTypes([]);
        type1Ref.current.clear();
        type2Ref.current.clear();
        typeRef.current.clear();
        teraRef.current.clear();
    };

    return (
        <div className="tera-raid-container">
            <div>
                <div className="pokemon-input">
                    Pokemon: {currentPokemon?.name.english}
                    <Typeahead
                        id="input"
                        className="game-input"
                        onChange={handlePokeType}
                        placeholder="Choose from Pokemon"
                        options={pokemonOptions}
                        ref={typeRef}
                    />
                    <button onClick={reset}>Reset</button>
                </div>
                <div className="type-list">
                    <div>
                        <div className="type-name">
                            Type 1:
                            {currentTypes[0] && (
                                <TypeList
                                    types={[currentTypes[0]]}
                                    useTypeColors
                                    justShow
                                />
                            )}
                        </div>
                        <Typeahead
                            id="input"
                            className="game-input"
                            onChange={(e) => handleTypeUpdate(e, 0)}
                            placeholder="Choose Type 1"
                            options={TYPES}
                            ref={type1Ref}
                        />
                    </div>
                    <div>
                        <div className="type-name">
                            Type 2:
                            {currentTypes[1] && (
                                <TypeList
                                    types={[currentTypes[1]]}
                                    useTypeColors
                                    justShow
                                />
                            )}
                        </div>{' '}
                        <Typeahead
                            id="input"
                            className="game-input"
                            onChange={(e) => handleTypeUpdate(e, 1)}
                            placeholder="Choose Type 2"
                            options={TYPES}
                            ref={type2Ref}
                        />
                    </div>

                    <div>
                        <div className="type-name">
                            Tera Type:
                            {teraTypes[0] && (
                                <TypeList
                                    types={[teraTypes[0]]}
                                    useTypeColors
                                    justShow
                                />
                            )}
                        </div>{' '}
                        <Typeahead
                            id="input"
                            className="game-input"
                            onChange={(e) => handleTypeUpdate(e, 2, true)}
                            placeholder="Tera Type"
                            options={TYPES}
                            ref={teraRef}
                            selected={
                                currentPokemon && teraTypes[0]
                                    ? [teraTypes[0].name]
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </div>
            {currentTypes.length > 0 && (
                <Stats currentTypes={currentTypes} teraTypes={teraTypes} />
            )}
        </div>
    );
}

const Stats = ({ currentTypes = [], teraTypes = [] }) => {
    const isTera = teraTypes.length > 0;
    const types = isTera ? teraTypes : currentTypes;
    const strongTowards = useMemo(() => {
        return [...currentTypes, ...teraTypes]
            .map((type) => type.damage_relations.double_damage_to)
            .flat();
    }, [currentTypes, teraTypes]);

    const weaknesses = useMemo(() => {
        const strongAgainst = [
            ...types.map((type) =>
                type.damage_relations.half_damage_from.map((hdf) => hdf.name)
            ),
        ].flat();

        const weakAgainst = types
            .map((type) => type.damage_relations.double_damage_from)
            .flat()
            .filter((type) => !strongAgainst.includes(type.name));
        return weakAgainst;
    }, [types]);

    const strengths = useMemo(() => {
        const weakAgainst = types
            .map((type) =>
                type.damage_relations.double_damage_from.map((hdf) => hdf.name)
            )
            .flat();

        const noDamage = types
            .map((type) =>
                type.damage_relations.no_damage_from.map((hdf) => hdf.name)
            )
            .flat();

        const strongAgainst = types
            .map((type) => type.damage_relations.half_damage_from)
            .flat()
            .filter((type) => !weakAgainst.includes(type.name))
            .filter((type) => !noDamage.includes(type.name));

        return strongAgainst;
    }, [types]);

    const fullResistance = useMemo(() => {
        return types.map((type) => type.damage_relations.no_damage_from).flat();
    }, [types]);

    return (
        <div className="stats">
            {weaknesses.length > 0 && (
                <div>
                    Weaknesses:{' '}
                    <TypeList
                        types={weaknesses}
                        useTypeColors
                        justShow
                        enableSuperEffective
                    />
                </div>
            )}
            {strongTowards.length > 0 && (
                <div>
                    Strong against:{' '}
                    <TypeList
                        types={strongTowards}
                        useTypeColors
                        justShow
                        enableSuperEffective
                    />
                </div>
            )}
            {strengths.length > 0 && (
                <div>
                    Resistance:{' '}
                    <TypeList
                        types={strengths}
                        useTypeColors
                        justShow
                        enableSuperEffective
                        strong
                    />
                </div>
            )}
            {fullResistance.length > 0 && (
                <div>
                    No Damage From:{' '}
                    <TypeList types={fullResistance} useTypeColors justShow />
                </div>
            )}
        </div>
    );
};

export default TeraRaidBattle;
