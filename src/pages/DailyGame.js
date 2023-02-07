import React, { useEffect, useMemo, useState } from 'react';
import Guess from './components/Guess';
import SearchBar from './components/SearchBar';
import { useDailyGame } from './hooks/useDailyGame';
import { GameAnswer } from './GameAnswer';
import { getFilter } from './components/utils';

import './Pages.scss';
import TypeFilter from './components/TypeFilter';

function DailyGame() {
    const {
        pokemon,
        guesses,
        hasWon,
        remainingGuesses,
        viewHint,
        handleClick,
        setViewHint,
    } = useDailyGame('hardGameState');
    const [showAnswer, setShowAnswer] = useState(hasWon);

    const emptyGuesses = ['?', '?', '?', '?', '?', '?', '?', '?'].slice(
        guesses.length
    );

    useEffect(() => {
        if (hasWon && !showAnswer) {
            setShowAnswer(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasWon]);

    const finished = hasWon || remainingGuesses === 0;

    const filter = useMemo(
        () => getFilter(guesses, pokemon),
        [guesses, pokemon]
    );

    return (
        <div className="daily-container">
            {!pokemon.name ? (
                <div>
                    Game is loading, may take a minute. Please wait/refresh.
                </div>
            ) : !hasWon && remainingGuesses <= 0 ? (
                <h2>You lost. The Pokemon was {pokemon?.name?.english}.</h2>
            ) : (
                <div>Remaining guesses: {remainingGuesses}</div>
            )}

            {pokemon.name && (
                <div className="game-container">
                    {viewHint && (
                        <div
                            className="game-hint"
                            style={{
                                backgroundImage: `url(${
                                    pokemon.imgUrl ?? pokemon.img?.default
                                })`,
                            }}
                        />
                    )}
                    <TypeFilter
                        disabled
                        excludedFilter={filter.exclude.types}
                        includedFilter={filter.include.types}
                    />
                    <SearchBar
                        className="game-form"
                        onSubmit={handleClick}
                        filter={filter}
                        disabled={hasWon || remainingGuesses <= 0}
                    />

                    {!hasWon &&
                        remainingGuesses < 2 &&
                        remainingGuesses > 0 && (
                            <button
                                type="button"
                                class="btn btn-outline-dark btn-sm game-hint-button"
                                onClick={() => setViewHint(!viewHint)}
                            >
                                {viewHint ? 'Hide' : 'Show'} hint
                            </button>
                        )}
                    {finished && (
                        <button
                            type="button"
                            class="btn btn-outline-dark btn-sm game-hint-button"
                            onClick={() => setShowAnswer(!showAnswer)}
                        >
                            {showAnswer ? 'Hide' : 'Show'} answer
                        </button>
                    )}
                    <div className="guesses">
                        {guesses &&
                            guesses.map((guess) => {
                                return (
                                    <Guess
                                        key={guess.name}
                                        guess={guess}
                                        pokemon={pokemon}
                                        showId={false}
                                        showArrows={true}
                                    />
                                );
                            })}
                        {guesses.length < 8 &&
                            [...emptyGuesses].map(() => <Guess empty />)}
                    </div>
                </div>
            )}
            {showAnswer && (
                <GameAnswer
                    show
                    close={() => setShowAnswer(false)}
                    hasWon={hasWon}
                    guesses={guesses}
                    pokemon={pokemon}
                    remainingGuesses={remainingGuesses}
                />
            )}
        </div>
    );
}

export default DailyGame;
