import { GENERATIONS } from '../constants';

export const determineGeneration = (guess, pokemon) => {
    const findGen = (gen, toFind) => {
        const foundIndex = toFind.index ? toFind.index : toFind;
        return foundIndex.id <= gen.range;
    };
    const guessGeneration = GENERATIONS.find((gen) => findGen(gen, guess));
    const pokemonGeneration = GENERATIONS.find((gen) => findGen(gen, pokemon));
    const difference = Math.abs(
        Number(guessGeneration.name.replace('Gen ', '')) -
            Number(pokemonGeneration.name.replace('Gen ', ''))
    );
    const proximity =
        difference === 0 ? 'correct' : difference === 1 ? 'almost' : 'absent';
    return {
        proximity,
        guessGeneration,
        pokemonGeneration,
    };
};

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
    const genFilter = isNaN(genNumber) ? false : getGenerationRange(genNumber);
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

export function getFilters(guesses, pokemon) {
    const types = Array.from(
        new Set(
            guesses.map(({ types }) => types.map((type) => type).flat()).flat()
        )
    );
    const guessedTypes = {
        ...types.reduce(
            (r, type) => ({
                ...r,
                [type.name]: type.isFound,
            }),
            {}
        ),
    };

    const guessedGen = guesses
        .filter((guess) => {
            if (!guess || !pokemon?.name) return false;
            const generation = determineGeneration(guess, pokemon);
            return generation.proximity === 'correct';
        })
        .map((guess) => {
            const generation = determineGeneration(guess, pokemon);
            return Number(generation.guessGeneration.name.split(' ')[1]) - 1;
        })[0];

    const includeFilter = Object.entries(guessedTypes)
        .filter(([, isFound]) => isFound)
        .map(([name]) => name.toLowerCase());

    const excludedFilter = Object.entries(guessedTypes)
        .filter(([, isFound]) => !isFound)
        .map(([name]) => name.toLowerCase());

    return { guessedGen, includeFilter, excludedFilter };
}
