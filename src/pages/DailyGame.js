import React, { useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Guess from './components/Guess';
import TypeList from './components/TypeList';
import { filterSuggestions } from './components/utils';
import { useDailyGame } from './hooks/useDailyGame';
import { GameAnswer } from './GameAnswer';
import * as pokedex from './pokedex.json';
import './Pages.scss';

function DailyGame() {
    const {
        pokemon,
        guesses,
        hasWon,
        remainingGuesses,
        viewHint,
        typeRef,
        handleClick,
        handleType,
        handleTypeAhead,
        setViewHint,
    } = useDailyGame('hardGameState');
    const [showAnswer, setShowAnswer] = useState(hasWon);

    const emptyGuesses = new Array(8 - guesses.length);

    useEffect(() => {
        if (hasWon && !showAnswer) {
            setShowAnswer(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasWon]);

    return (
        <div className="daily-container">
            {!pokemon.name ? (
                <div>
                    Game is loading, may take a minute. Please wait/refresh.
                </div>
            ) : !hasWon && remainingGuesses === 0 ? (
                <h2>You lost. The Pokemon was {pokemon?.name?.english}.</h2>
            ) : (
                <div>Remaining guesses: {remainingGuesses}</div>
            )}

            {pokemon.name && (
                <div className="game-container">
                    {viewHint && pokemon.img && (
                        <div
                            className="game-hint"
                            aria-label={pokemon?.name?.english}
                            style={{
                                backgroundImage: `url(${pokemon.img?.default})`,
                            }}
                        />
                    )}
                    <TypeList
                        types={guesses.map((guess) => guess.types).flat()}
                    />
                    <form className="game-form" onSubmit={handleClick}>
                        <Typeahead
                            id="input"
                            role="input"
                            className="game-input"
                            onChange={handleTypeAhead}
                            onInputChange={handleType}
                            placeholder="who's that pokemon?"
                            options={Array.from(pokedex)
                                .filter((pokemon) =>
                                    filterSuggestions(pokemon, guesses, 809)
                                )
                                .map((pokemon) => {
                                    return pokemon.name.english;
                                })}
                            ref={typeRef}
                        />
                        <input
                            type="submit"
                            value="Guess"
                            className="game-button"
                            disabled={hasWon}
                        ></input>
                        {!hasWon && remainingGuesses < 4 && (
                            <button
                                type="button"
                                class="btn btn-outline-dark btn-sm game-hint-button"
                                onClick={() => setViewHint(!viewHint)}
                            >
                                {viewHint ? 'Hide' : 'Show'} hint
                            </button>
                        )}
                        {hasWon && (
                            <button
                                type="button"
                                class="btn btn-outline-dark btn-sm game-hint-button"
                                onClick={() => setShowAnswer(!showAnswer)}
                            >
                                {showAnswer ? 'Hide' : 'Show'} answer
                            </button>
                        )}
                    </form>
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
            <GameAnswer show={showAnswer} close={() => setShowAnswer(false)} />
        </div>
    );
}

export default DailyGame;
