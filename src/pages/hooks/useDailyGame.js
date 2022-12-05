import React, { useState, useEffect, useCallback } from 'react';
import { getBaseStats, getImg } from '../components/utils';
import { useLocalStorage } from './useLocalStorage';
import { determineProximity } from '../components/Guess';

import * as pokedex from '../pokedex.json';

const ID_LIST = process.env.REACT_APP_POKEMON_DAILY_HARD_LIST.split(',');

const START_DATE = new Date('3/15/2022').setHours(0, 0, 0, 0);
const TODAY_DATE = new Date().setHours(0, 0, 0, 0);

export function useDailyGame(gameName = 'hardGameState') {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [hasWon, setHasWon] = useState(false);
    const [remainingGuesses, setRemainingGuesses] = useState(8);
    const [viewHint, setViewHint] = useState(false);
    const [gameState, setGameState] = useLocalStorage(gameName, {
        dailyWon: false,
        dailyDate: new Date().getDate(),
        numGuessesLeft: remainingGuesses ?? 8,
        streak: 0,
        guesses: [],
    });
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

    useEffect(() => {
        if (remainingGuesses < 0) {
            setGameState({
                dailyWon: false,
                dailyDate: new Date().getDate(),
                numGuessesLeft: 0,
                streak: 0,
                guesses: guesses,
            });
            setHasWon(false);
            setRemainingGuesses(0);
        }
    }, [gameState, guesses, setGameState, remainingGuesses]);

    useEffect(() => {
        if (!pokemon.name) {
            const todaysNumber = Math.round((TODAY_DATE - START_DATE) / 865e5);
            const index = Number(ID_LIST[todaysNumber]);
            const solution = Array.from(pokedex).find(
                (poke) => poke.id === index
            );
            getImg(solution).then((updatedMon) => setPokemon(updatedMon));

            if (!gameState || gameState.dailyDate !== new Date().getDate()) {
                const streak = !gameState ? 0 : gameState.streak;

                setGameState({
                    dailyWon: false,
                    dailyDate: new Date().getDate(),
                    numGuessesLeft: 8,
                    streak: streak,
                    guesses: [],
                });
            } else {
                setHasWon(gameState.dailyWon);
                setRemainingGuesses(gameState.numGuessesLeft);
                setGameState({
                    ...gameState,
                    guesses: gameState.guesses,
                });
            }
        }
    }, [gameState, pokemon.name, setGameState]);

    /** returns Guess object compared against the current answer. */
    const getGuessFromPokemon = (guessPokemon) => {
        if (!guessPokemon) {
            return new Error(`${guessPokemon} is not present`);
        }
        const { base, name, id, type } = guessPokemon;
        const { id: correctId = 0, type: correctType = [] } = pokemon;

        const guessPokemonBaseTotal = getBaseStats(guessPokemon);
        const pokemonBaseTotal = getBaseStats(pokemon);

        return {
            name,
            index: {
                id,
                difference: correctId - id,
            },
            types: type.map((typing, index) => {
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
        };
    };

    const handleClick = (e) => {
        e.preventDefault();
        typeRef.current.clear();
        const currentGuesses = gameState.guesses;

        if (guess.length > 1) {
            const valid = Array.from(pokedex)
                .map(({ name, ...stats }) => ({
                    ...stats,
                    name: name.english,
                }))
                .find(({ name }) => name.toLowerCase() === guess.toLowerCase());

            const totalGuessesLeft = remainingGuesses - 1;
            setRemainingGuesses(totalGuessesLeft);

            if (valid) {
                const guess = getGuessFromPokemon(valid);
                currentGuesses.push(guess);

                setGuess('');

                if (valid.id === pokemon.id) {
                    const streak = (Number(gameState.streak) || 0) + 1;
                    setGameState({
                        dailyWon: true,
                        dailyDate: new Date().getDate(),
                        numGuessesLeft: totalGuessesLeft,
                        streak: streak,
                        guesses: guesses,
                    });
                    setHasWon(true);
                    return;
                }
            }

            if (totalGuessesLeft === 0) {
                setGameState({
                    dailyWon: false,
                    dailyDate: new Date().getDate(),
                    numGuessesLeft: 0,
                    streak: 0,
                    guesses: guesses,
                });
            } else {
                setGameState({
                    ...gameState,
                    numGuessesLeft: totalGuessesLeft,
                    guesses: currentGuesses,
                });
            }
        }
    };

    const handleType = (e) => {
        if (e) setGuess(e);
    };

    const handleTypeAhead = (e) => {
        if (e.length > 0) {
            setGuess(e[0]);
        }
    };

    const handleShare = async () => {
        const todaysNumber = Math.round((TODAY_DATE - START_DATE) / 865e5);
        const emojiGrid = generateEmojiGrid();

        const textToShare = `Pokeordle ${todaysNumber} ${
            8 - remainingGuesses
        }/8 \n\n${emojiGrid}`;
        await navigator.clipboard.writeText(textToShare);
    };

    const getTypeEmoji = useCallback((types) => {
        const typeEmojis = types.map(({ isFound, isSameIndex }) =>
            generateEmoji(isFound && isSameIndex, isFound)
        );
        return typeEmojis.length > 1 ? typeEmojis.join('') : `${typeEmojis}🟩`;
    }, []);

    const generateEmoji = (isExact, isClose) =>
        isExact ? '🟩' : isClose ? '🟨' : '⬛';

    const generateEmojiGrid = useCallback(() => {
        return guesses
            .reverse()
            .map((guess) => {
                const { baseTotal, index } = guess;
                const indexDifference = Math.abs(index.difference);
                const baseTotalDifference = Math.abs(baseTotal.difference);

                // Set Name, dumb I know but good enough for now
                let guessText = generateEmoji(indexDifference === 0, false);

                // Set Gen
                guessText += generateEmoji(
                    determineProximity(indexDifference) === 'correct',
                    determineProximity(indexDifference) === 'almost'
                );

                // Set Types
                guessText += getTypeEmoji(guess.types);

                // Set Base Total
                guessText += generateEmoji(
                    determineProximity(baseTotalDifference) === 'correct',
                    determineProximity(baseTotalDifference) === 'almost'
                );

                return guessText;
            })
            .join('\n');
    }, [guesses, getTypeEmoji]);

    return {
        pokemon,
        guess,
        guesses,
        hasWon,
        remainingGuesses,
        streak,
        viewHint,
        typeRef,
        handleClick,
        handleType,
        handleTypeAhead,
        setViewHint,
        handleShare,
    };
}
