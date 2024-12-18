import React, { useCallback, useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import {
    getBaseStats,
    getFilterFromGuess,
    mergeFilterStates,
} from '../components/utils';
import { useLocalStorage } from './useLocalStorage';

import { DEFAULT_FILTER_STATE } from '../constants';
import * as pokedex from '../pokedex.json';

const ID_LIST = process.env.REACT_APP_POKEMON_DAILY_HARD_LIST.split(',');

// Old start date 3/15/2022
const START_DATE = new Date('12/18/2024').setHours(0, 0, 0, 0);
const TODAY_DATE = new Date().setHours(0, 0, 0, 0);

export function useDailyGame(gameName = 'hardGameState') {
    const [pokemon, setPokemon] = useState({});
    const [hasWon, setHasWon] = useState(false);
    const [remainingGuesses, setRemainingGuesses] = useState(8);
    const [viewHint, setViewHint] = useState(false);
    const [gameState, setGameState] = useLocalStorage(gameName, {
        dailyWon: false,
        dailyDate: new Date().getDate(),
        numGuessesLeft: remainingGuesses ?? 8,
        streak: 0,
        guesses: [],
        savedFilterState: DEFAULT_FILTER_STATE,
    });
    const [filterState, setFilterState] = useState(
        gameState.savedFilterState ?? DEFAULT_FILTER_STATE
    );
    const { streak, guesses } = gameState;
    const typeRef = React.createRef();

    useEffect(() => {
        if (!hasWon) {
            const isFound = guesses.findIndex(
                (guess) => guess.index.id === pokemon.id
            );
            if (isFound > -1) {
                setHasWon(true);
            }
        }
    }, [hasWon, guesses, pokemon]);

    const updateGameState = useCallback(
        (newGameState) => {
            setGameState(newGameState);
        },
        [setGameState]
    );

    useEffect(() => {
        if (remainingGuesses < 0) {
            updateGameState({
                dailyWon: false,
                dailyDate: new Date().getDate(),
                numGuessesLeft: 0,
                streak: 0,
                guesses: guesses,
                savedFilterState: DEFAULT_FILTER_STATE,
            });
            setHasWon(false);
            setRemainingGuesses(0);
        }
    }, [gameState, guesses, updateGameState, remainingGuesses]);

    useEffect(() => {
        if (!pokemon.name) {
            ReactGA.event({
                category: 'Daily Game',
                action: 'Load Daily Game',
            });
            const todaysNumber = Math.round((TODAY_DATE - START_DATE) / 865e5);
            const index = Number(ID_LIST[todaysNumber]);
            const solution = Array.from(pokedex).find(
                (poke) => poke.id === index
            );
            setPokemon(solution);

            const incorrectGuesses =
                guesses.length !==
                filterState.exclude.pokemon.length +
                    filterState.include.pokemon.length;

            if (incorrectGuesses) {
                setFilterState(DEFAULT_FILTER_STATE);
            }

            if (!gameState || gameState.dailyDate !== new Date().getDate()) {
                const streak = !gameState ? 0 : gameState.streak;

                updateGameState({
                    dailyWon: false,
                    dailyDate: new Date().getDate(),
                    numGuessesLeft: 8,
                    streak: streak,
                    guesses: [],
                    savedFilterState: DEFAULT_FILTER_STATE,
                });
                setFilterState(DEFAULT_FILTER_STATE);
            } else {
                setHasWon(gameState.dailyWon);
                setRemainingGuesses(gameState.numGuessesLeft);
                updateGameState({
                    ...gameState,
                    guesses: gameState.guesses,
                    savedFilterState: filterState,
                });
            }
        }
    }, [filterState, gameState, guesses.length, pokemon.name, updateGameState]);

    /** returns Guess object compared against the current answer. */
    const getGuessFromPokemon = useCallback(
        (guessPokemon) => {
            if (!guessPokemon) {
                return new Error(`${guessPokemon} is not present`);
            }
            const { base, name, id, types } = guessPokemon;
            const { id: correctId = 0, types: correctType = [] } = pokemon;

            const guessPokemonBaseTotal = getBaseStats(guessPokemon);
            const pokemonBaseTotal = getBaseStats(pokemon);

            return {
                name,
                index: {
                    id,
                    difference: correctId - id,
                },
                types: types.map((typing, index) => {
                    const guessFoundIndex = correctType.indexOf(typing);
                    return {
                        name: typing,
                        isFound: guessFoundIndex > -1,
                        isSameIndex: guessFoundIndex === index,
                    };
                }),
                baseTotal: {
                    total: guessPokemonBaseTotal,
                    difference: pokemonBaseTotal - guessPokemonBaseTotal,
                    stats: base,
                },
                imgUrl: guessPokemon.imgUrl,
                evolutionStage: guessPokemon.evolutionStage,
            };
        },
        [pokemon]
    );

    const handleClick = (search) => {
        if (search) {
            const currentGuesses = [...gameState.guesses];
            const totalGuessesLeft = remainingGuesses - 1;
            setRemainingGuesses(totalGuessesLeft);
            const guess = getGuessFromPokemon(search);
            currentGuesses.push(guess);

            const updatedFilterState = getFilterFromGuess(guess, pokemon);
            const newFilterState = mergeFilterStates(
                filterState,
                updatedFilterState
            );

            setFilterState(newFilterState);

            if (search.id === pokemon.id) {
                const streak = (Number(gameState.streak) || 0) + 1;
                setGameState({
                    dailyWon: true,
                    dailyDate: new Date().getDate(),
                    numGuessesLeft: totalGuessesLeft,
                    streak: streak,
                    guesses: currentGuesses,
                    savedFilterState: newFilterState,
                });
                setHasWon(true);
                return;
            }

            if (totalGuessesLeft === 0) {
                setGameState({
                    dailyWon: false,
                    dailyDate: new Date().getDate(),
                    numGuessesLeft: 0,
                    streak: 0,
                    guesses: currentGuesses,
                    savedFilterState: DEFAULT_FILTER_STATE,
                });
            } else {
                setGameState({
                    ...gameState,
                    numGuessesLeft: totalGuessesLeft,
                    guesses: currentGuesses,
                    savedFilterState: newFilterState,
                });
            }
        }
    };

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
            setGameState({
                ...gameState,
                savedFilterState: newFilterState,
            });
        },
        [filterState, gameState, setGameState, setFilterState]
    );

    return {
        pokemon,
        guesses,
        hasWon,
        remainingGuesses,
        streak,
        viewHint,
        typeRef,
        filterState,
        handleFilterChange,
        handleClick,
        setViewHint,
    };
}
