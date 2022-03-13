import { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Guess from './components/Guess';
import TypeList from './components/TypeList';
import {
    getIntWithinRange,
    filterSuggestions,
    getBaseStats,
    getImg,
} from './components/utils';

import * as pokedex from './pokedex.json';
import './App.css';

function OriginalGame() {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [viewHint, setViewHint] = useState(false);

    useEffect(() => {
        if (!pokemon.name) {
            initialize();
        }
    }, [pokemon.name]);

    const initialize = () => {
        setGuess('');
        setGuesses([]);
        setViewHint(false);
        const index = getIntWithinRange(Math.random(), 1, 152);
        const pokemon = pokedex[index];
        getImg(pokemon).then((updatedMon) => setPokemon(updatedMon));
    };

    const handleClick = (e) => {
        e.preventDefault();
        if (guess) {
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
                    },
                };
                setGuesses([guess, ...guesses]);

                if (valid.id === pokemon.id) {
                    setViewHint(false);
                    setHasWon(true);
                }
            }
        }
    };

    const handleType = (e) => {
        const guess = formatGuess(e);
        if (guess) setGuess(guess);
    };

    const handleTypeAhead = (e) => {
        if (e.length > 0) {
            setGuess(formatGuess(e[0].split(' ')[1]));
        }
    };

    const formatGuess = (rawGuess) => {
        return rawGuess.replace(/#[0-9]* /g, '');
    };

    return (
        <div className="original-container">
            <strong className="message">Unlimited guesses. Only Gen 1.</strong>

            {!hasWon ? (
                pokemon.name && (
                    <div className="game-container">
                        {viewHint && pokemon.img && (
                            <img
                                className="game-hint"
                                src={pokemon.img.default}
                                alt="game hint"
                            />
                        )}
                        <TypeList guesses={guesses} />
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
                                        filterSuggestions(pokemon, guesses, 151)
                                    )
                                    .map((pokemon) => {
                                        return `#${pokemon.id} ${pokemon.name.english}`;
                                    })}
                            />
                            <input
                                type="submit"
                                value="Guess"
                                class="btn btn-light game-button"
                            ></input>
                            <button
                                type="button"
                                class="btn btn-outline-dark btn-sm game-hint-button"
                                onClick={() => setViewHint(!viewHint)}
                            >
                                {viewHint ? 'Hide' : 'Show'} hint
                            </button>
                        </form>
                        <div className="guesses">
                            {guesses &&
                                guesses.map((guess) => {
                                    return (
                                        <Guess
                                            key={guess.name}
                                            guess={guess}
                                            pokemon={pokemon}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                )
            ) : (
                <div className="game-reveal">
                    <h2>You won! The Pokemon was {pokemon.name.english}!</h2>
                    {pokemon.img && (
                        <img
                            className="game-answer"
                            src={pokemon.img.default}
                        />
                    )}
                    <button
                        class="btn btn-outline-dark btn-sm game-reset"
                        onClick={() => {
                            setHasWon(false);
                            initialize();
                        }}
                    >
                        New Pokemon
                    </button>
                </div>
            )}
        </div>
    );
}

export default OriginalGame;
