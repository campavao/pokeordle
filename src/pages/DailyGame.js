import React, { useEffect, useState } from 'react';
import Guess from './components/Guess';
import SearchBar from './components/SearchBar';
import { useDailyGame } from './hooks/useDailyGame';
import { GameAnswer } from './GameAnswer';

import './Pages.scss';
import { FilterContainer } from './components/TypeFilter';

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

    useEffect(() => {
        if (hasWon) {
            setShowAnswer(true);
        }
    }, [hasWon]);

    const finished = hasWon || remainingGuesses === 0;

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
                    <div className="top-row">
                        <FilterContainer
                            filterState={filterState}
                            updateFilterState={handleFilterChange}
                        />
                        <SearchBar
                            className="game-form"
                            onSubmit={handleClick}
                            filter={filterState}
                            disabled={hasWon || remainingGuesses <= 0}
                        />
                        <button
                            type="button"
                            class="btn btn-outline-dark btn-sm game-hint-button"
                            onClick={() => setViewHint(!viewHint)}
                        >
                            {viewHint ? 'Hide' : 'Show'} hint
                        </button>
                    </div>
                    <div>Remaining guesses: {remainingGuesses}</div>
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
