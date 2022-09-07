import React, { useState, useCallback } from 'react';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { determineProximity } from './components/Guess';

import { START_DATE, TODAY_DATE } from './constants';
import { copyToClipboard } from './copyToClipboard';

import './components/Guess.scss';

export function GameAnswer({
    show,
    close,
    hasWon,
    guesses,
    pokemon,
    currStreak,
    remainingGuesses,
}) {
    const [copyMessage, setCopyMessage] = useState('Share');

    const handleShare = async () => {
        const todaysNumber = Math.round((TODAY_DATE - START_DATE) / 865e5);
        const emojiGrid = generateEmojiGrid();

        const textToShare = `Pokeordle ${todaysNumber} ${
            remainingGuesses === 0 ? 'X' : 8 - remainingGuesses
        }/8 \n\n${emojiGrid}`;

        setCopyMessage('Copied!');
        copyToClipboard(textToShare);
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
        const guessesCopy = [...guesses];
        return guessesCopy
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
                        Current Streak: {currStreak}
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
