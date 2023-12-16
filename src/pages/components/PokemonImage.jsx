import { getImgNumber } from './utils';

export function PokemonImage({ pokemon, isHint }) {
    return (
        <img
            className={isHint ? 'game-hint' : 'game-answer'}
            src={pokemon.imgUrl ?? `/images/${getImgNumber(pokemon.id)}.png`}
            alt="hint"
        />
    );
}
