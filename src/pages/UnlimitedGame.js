import { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Guess from './components/Guess';
import TypeList from './components/TypeList';
import {
    getIntWithinRange,
    filterSuggestions,
    getBaseStats,
} from './components/utils';

import * as pokedex from './pokedex.json';
import './App.css';

function UnlimitedGame() {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);

    useEffect(() => {
        if (!pokemon.name) {
            const index = getIntWithinRange(Math.random(), 1, 810);
            const pokemon = pokedex[index];
            const imgNum =
                index < 10 ? `00${index}` : index < 100 ? `0${index}` : index;
            const imgSrc = `/data/images/${imgNum}.png`;
            pokemon.img = imgSrc;
            setPokemon(pokemon);
        }
    }, [pokemon.name]);

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
            setGuess(formatGuess(e[0]));
        }
    };

    const formatGuess = (rawGuess) => {
        return rawGuess.replace(/#[0-9]* /g, '');
    };

    return (
        <div className="unlimited-container">
            <strong className="message">
                Unlimited guesses, all Generations up to Gen 7.
            </strong>
            {!hasWon ? (
                pokemon.name && (
                    <div className="game-container">
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
                                        filterSuggestions(pokemon, guesses, 809)
                                    )
                                    .map((pokemon) => {
                                        return `#${pokemon.id} ${pokemon.name.english}`;
                                    })}
                            />
                            <input
                                type="submit"
                                value="Guess"
                                className="game-button"
                            ></input>
                        </form>
                        <div className="guesses">
                            {guesses &&
                                guesses.map((guess) => {
                                    return (
                                        <Guess
                                            key={guess.name}
                                            guess={guess}
                                            pokemon={pokemon}
                                            showArrows={true}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                )
            ) : (
                <h2>You won! The Pokemon was {pokemon.name.english}!</h2>
            )}
        </div>
    );
}

export default UnlimitedGame;
