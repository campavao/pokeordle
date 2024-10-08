import React, { useState, useCallback, useEffect } from 'react';
import ReactGA from 'react-ga4';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { determineProximity, isAlmostEvolution } from './components/Guess';
import { determineGeneration, getImgNumber } from './components/utils';

import { useDailyGame } from './hooks/useDailyGame';

import { START_DATE, TODAY_DATE } from './constants';
import { copyToClipboard } from './copyToClipboard';

import './components/Guess.scss';

export function GameAnswer({ show, close }) {
    useEffect(() => {
        if (show) {
            ReactGA.event({
                category: 'Game Answer',
                action: show ? 'Show Answer' : 'Hide Answer',
            });
        }
    }, [show]);

    const { pokemon, guesses, hasWon, remainingGuesses, streak } =
        useDailyGame('hardGameState');
    const [copyMessage, setCopyMessage] = useState(
        'share' in navigator ? 'Share' : 'Copy'
    );

    const handleShare = async () => {
        const todaysNumber = Math.round((TODAY_DATE - START_DATE) / 865e5);
        const emojiGrid = generateEmojiGrid();

        const textToShare = `Pokeordle ${todaysNumber} ${
            remainingGuesses === 0 && !hasWon ? 'X' : 8 - remainingGuesses
        }/8 \n\n${emojiGrid} \n\nhttps://pokeordle.com`;

        const isMobile = window.innerWidth < 500;

        if (isMobile && navigator.share) {
            navigator
                .share({
                    title: "Who's that Pokemon?",
                    text: textToShare,
                })
                .then(() => console.log('Shared!'))
                .catch((err) => console.error(err));
        } else {
            copyToClipboard(textToShare);
            setCopyMessage('Copied!');
        }
    };

    const getTypeEmoji = useCallback(
        (types) => {
            const possibleTypes = pokemon?.types?.length;
            const typeEmojis = types.map(({ isFound, isSameIndex }) =>
                generateEmoji(isFound && isSameIndex, isFound)
            );
            return typeEmojis.length > 1
                ? typeEmojis.join('')
                : `${typeEmojis}${possibleTypes === 1 ? '🟩' : '⬛'}`;
        },
        [pokemon?.types?.length]
    );

    const generateEmoji = (isExact, isClose) =>
        isExact ? '🟩' : isClose ? '🟨' : '⬛';

    const generateEmojiGrid = useCallback(() => {
        const guessesCopy = [...guesses];
        return guessesCopy
            .map((guess) => {
                const { baseTotal } = guess;
                const { proximity: genProximity } = determineGeneration(
                    guess,
                    pokemon
                );
                const baseTotalDifference = Math.abs(baseTotal.difference);
                const baseTotalProximity =
                    determineProximity(baseTotalDifference);

                // Set Gen
                let guessText = generateEmoji(
                    genProximity === 'correct',
                    genProximity === 'almost'
                );

                // Set Types
                guessText += getTypeEmoji(guess.types);

                // Set Evolution
                guessText += generateEmoji(
                    guess.evolutionStage === pokemon.evolutionStage,
                    isAlmostEvolution(guess.evolutionStage, pokemon)
                );

                // Set Base Total
                guessText += generateEmoji(
                    baseTotalProximity === 'correct',
                    baseTotalProximity === 'almost'
                );

                return guessText;
            })
            .join('\n');
    }, [guesses, getTypeEmoji, pokemon]);
    return (
        <>
            <Modal show={show} onHide={close} scrollable={true}>
                <Modal.Header
                    closeButton
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <Modal.Title>You {hasWon ? 'won!' : 'lost.'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="game-reveal">
                        <h2
                            style={{
                                textAlign: 'center',
                            }}
                        >
                            The Pokemon was {pokemon?.name?.english}!
                        </h2>
                        Current Streak: {streak}
                        <img
                            className="game-answer"
                            src={
                                pokemon?.imgUrl ??
                                `/images/${getImgNumber(pokemon.id)}.png`
                            }
                            alt={pokemon?.name?.english}
                        />
                        <button
                            className="type-list-item correct-type"
                            onClick={handleShare}
                            id="share"
                        >
                            {copyMessage}
                        </button>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={close}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
