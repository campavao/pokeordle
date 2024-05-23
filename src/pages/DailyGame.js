import React, { useEffect, useState } from 'react';
import Guess from './components/Guess';
import { useDailyGame } from './hooks/useDailyGame';
import { GameAnswer } from './GameAnswer';

import './Pages.scss';
import { SearchWithFilter } from './components/SearchWithFilter';
import { getImgNumber } from './components/utils';

function DailyGame() {
    const {
        pokemon,
        guesses,
        hasWon,
        remainingGuesses,
        viewHint,
        filterState,
        handleFilterChange,
        handleClick,
        setViewHint,
    } = useDailyGame('hardGameState');
    const [showAnswer, setShowAnswer] = useState(hasWon);

    const emptyGuesses = ['?', '?', '?', '?', '?', '?', '?', '?'].slice(
        guesses.length
    );

    const finished = hasWon || remainingGuesses === 0;

    useEffect(() => {
        if (finished) {
            setShowAnswer(true);
        }
    }, [finished]);

    return (
        <div className="daily-container">
            {!pokemon.name ? (
                <div>
                    Game is loading, may take a minute. Please wait/refresh.
                </div>
            ) : (
                !hasWon &&
                remainingGuesses <= 0 && (
                    <h2>You lost. The Pokemon was {pokemon?.name?.english}.</h2>
                )
            )}

            {!hasWon && remainingGuesses < 2 && remainingGuesses > 0 && (
                <button
                    type="button"
                    class="btn btn-outline-dark btn-sm game-hint-button"
                    onClick={() => setViewHint(!viewHint)}
                >
                    {viewHint ? 'Hide' : 'Show'} hint
                </button>
            )}

            {pokemon.name && (
                <div className="game-container">
                    {viewHint && (
                        <img
                            className="game-hint"
                            src={
                                pokemon.imgUrl ??
                                `/images/${getImgNumber(pokemon.id)}.png`
                            }
                            alt="hint"
                        />
                    )}

                    <SearchWithFilter
                        filterState={filterState}
                        handleFilterChange={handleFilterChange}
                        handleClick={handleClick}
                        disabled={hasWon || remainingGuesses <= 0}
                    />
                    <div>Remaining guesses: {remainingGuesses}</div>

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
                            [...emptyGuesses].map((_, index) => (
                                <Guess
                                    key={'guess-' + index}
                                    empty
                                    id={index}
                                />
                            ))}
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
