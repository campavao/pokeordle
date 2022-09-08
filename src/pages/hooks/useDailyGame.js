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
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [remainingGuesses, setRemainingGuesses] = useState(8);
    const [currStreak, setCurrStreak] = useState(0);
    const [viewHint, setViewHint] = useState(false);
    const [gameState, setGameState] = useLocalStorage(gameName, {
        dailyWon: false,
        dailyDate: new Date().getDate(),
        numGuessesLeft: remainingGuesses ?? 8,
        streak: 0,
        guesses: [],
    });
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

                setCurrStreak(streak);
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
                setCurrStreak(gameState.streak);
                setGuesses(gameState.guesses);
            }
        }
    }, [pokemon.name, gameState, setGameState]);

    const handleClick = (e) => {
        e.preventDefault();
        typeRef.current.clear();
        let newGuesses = [];
        let newHasWon = false;

        if (guess.length > 1) {
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
                        stats: valid.base,
                    },
                };
                newGuesses = [...guesses, guess];

                setGuesses(newGuesses);
                setGuess('');

                if (valid.id === pokemon.id) {
                    const previoushardGameState = JSON.parse(
                        localStorage.getItem(gameName)
                    );
                    const streak =
                        (Number(previoushardGameState.streak) || 0) + 1;
                    setCurrStreak(streak);
                    setGameState({
                        dailyWon: true,
                        dailyDate: new Date().getDate(),
                        numGuessesLeft: remainingGuesses,
                        streak: streak,
                        guesses: guesses,
                    });
                    newHasWon = true;
                    setHasWon(newHasWon);
                }
            }

            const totalGuessesLeft = remainingGuesses - 1;
            setRemainingGuesses(totalGuessesLeft);
            if (totalGuessesLeft === 0 && !newHasWon) {
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
                    guesses: newGuesses,
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
        currStreak,
        viewHint,
        typeRef,
        handleClick,
        handleType,
        handleTypeAhead,
        setViewHint,
        handleShare,
    };
}
