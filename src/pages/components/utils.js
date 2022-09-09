import { GENERATIONS } from '../constants';

export const getIntWithinRange = (input, min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(input * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

const getGenerationRange = (generation) => {
    const min = generation === 0 ? 0 : GENERATIONS[generation - 1].range;
    const max = GENERATIONS[generation].range;
    return {
        min,
        max,
    };
};

export const filterSuggestions = (
    pokemon,
    guesses,
    genCap,
    filter = [],
    excludedFilter = [],
    genNumber
) => {
    const genFilter = !genNumber ? false : getGenerationRange(genNumber);
    return (
        pokemon.id <= genCap &&
        (!genFilter ||
            (pokemon.id > genFilter.min && pokemon.id <= genFilter.max)) &&
        (filter.length === 0 ||
            filter.every((filterType) =>
                pokemon.type
                    .map((type) => type.toLowerCase())
                    .includes(filterType.toLowerCase())
            )) &&
        (excludedFilter.length === 0 ||
            !excludedFilter.some((filterType) =>
                pokemon.type
                    .map((type) => type.toLowerCase())
                    .includes(filterType.toLowerCase())
            )) &&
        !guesses.find((guess) => guess.index.id === pokemon.id)
    );
};

export const getBaseStats = (guessPokemon) => {
    const { hp, attack, defense, spAttack, spDefense, speed } =
        guessPokemon.base;
    return hp + attack + defense + spAttack + spDefense + speed;
};

export const getImgUrl = async (index) => {
    const imgNum =
        index < 10 ? `00${index}` : index < 100 ? `0${index}` : index;
    return await import(`../../images/${imgNum}.png`);
};

export const getImg = async (pokemon) => {
    const index = pokemon.id;
    if (!index) return;
    return {
        ...pokemon,
        img: await getImgUrl(index),
    };
};

export const getQuickImg = async (pokemon) => {
    const index = pokemon.id;
    if (!index) return;
    return await getImgUrl(index).then((imgSrc) => {
        return {
            ...pokemon,
            img: imgSrc,
        };
    });
};

export function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
