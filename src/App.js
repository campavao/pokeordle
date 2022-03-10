import { useState, useEffect } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import Guess from './components/Guess';
import * as pokedex from './pokedex.json';
import './App.css';

function App() {
    const [pokemon, setPokemon] = useState({});
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);

    useEffect(() => {
        if (!pokemon.name) {
            const randomNumber = Math.ceil(Math.random() * 100);
            const index = Math.min(Math.max(randomNumber, 0), 809);
            const pokemon = pokedex[index];
            const imgNum =
                index < 10 ? `00${index}` : index < 100 ? `0${index}` : index;
            const imgSrc = `/data/images/${imgNum}.png`;
            pokemon.img = imgSrc;
            setPokemon(pokemon);
        }
    }, [pokemon.name]);

    const getBaseStats = (guessPokemon) => {
        const { hp, attack, defense, spAttack, spDefense, speed } =
            guessPokemon.base;
        return hp + attack + defense + spAttack + spDefense + speed;
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
                    types: valid.type.map((typing, index) => {
                        return {
                            name: typing,
                            isFound: pokemon.type.includes(typing),
                            isSameIndex: pokemon.type.indexOf(typing) === index,
                        };
                    }),
                    baseTotal: {
                        total: validBaseTotal,
                        difference: Math.abs(pokemonBaseTotal - validBaseTotal),
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
        setGuess(e[0]);
    };

    return (
        <div className="container">
            <h1>Pokeordle</h1>
            {!hasWon ? (
                pokemon.name && (
                    <div className="game-container">
                        <form className="game-form" onSubmit={handleClick}>
                            <Typeahead
                                id="input"
                                className="game-input"
                                onChange={handleType}
                                placeholder="who's that pokemon?"
                                options={Array.from(pokedex).map((pokemon) => {
                                    return pokemon.name.english;
                                })}
                            />
                            <input type="submit" value="Guess" className="game-button"></input>
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
                <h2>You won! The Pokemon was {pokemon.name.english}!</h2>
            )}
        </div>
    );
}

export default App;
