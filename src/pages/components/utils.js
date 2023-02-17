import { GENERATIONS } from '../constants';

export const getGeneration = (pokemon) => {
    const findGen = (gen, toFind) => {
        const foundIndex = toFind.index ? toFind.index : toFind;
        return foundIndex.id <= gen.range;
    };
    return GENERATIONS.find((gen) => findGen(gen, pokemon))?.gen;
};

export const determineGeneration = (guess, pokemon) => {
    const guessGeneration = getGeneration(guess);
    const pokemonGeneration = getGeneration(pokemon);
    const difference = Math.abs(guessGeneration - pokemonGeneration);
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

export const getFilter = (guesses, pokemon, additionalFilter) => {
    const hasIncludeSingle = additionalFilter.types.include.includes('X');
    const hasExcludeSingle = additionalFilter.types.exclude.includes('X');

    if (hasIncludeSingle) {
        additionalFilter.types.include = additionalFilter.types.include.filter(
            (type) => type !== 'X'
        );
    }

    if (hasExcludeSingle) {
        additionalFilter.types.exclude = additionalFilter.types.exclude.filter(
            (type) => type !== 'X'
        );
    }

    const filter = getFilterFromGuesses(guesses, pokemon);

    if (additionalFilter) {
        if (additionalFilter.types) {
            filter.include.types = [
                ...filter.include.types.filter(
                    (type) => !additionalFilter.types.exclude.includes(type)
                ),
                ...additionalFilter.types.include,
            ];

            filter.exclude.types = [
                ...filter.exclude.types.filter(
                    (type) => !additionalFilter.types.include.includes(type)
                ),
                ...additionalFilter.types.exclude,
            ];
        }
    }

    const amountOfTypes = hasIncludeSingle
        ? 1
        : hasExcludeSingle
        ? 2
        : filter.amountOfTypes;

    return {
        ...filter,
        amountOfTypes,
    };
};

export const getFilterFromGuesses = (guesses, pokemon) => {
    const generations = guesses.reduce(
        (getFilter, guess) => {
            const { proximity } = determineGeneration(guess, pokemon);
            return {
                include: [
                    ...getFilter.include,
                    ...(proximity === 'correct' ? [getGeneration(guess)] : []),
                ],
                exclude: [
                    ...getFilter.exclude,
                    ...(proximity !== 'correct' ? [getGeneration(guess)] : []),
                ],
            };
        },
        { include: [], exclude: [] }
    );

    const types = guesses.reduce(
        (typeFilter, guess) => {
            return {
                include: [
                    ...typeFilter.include,
                    ...guess.types
                        .filter((type) => type.isFound)
                        .map((type) => type.name),
                ],
                exclude: [
                    ...typeFilter.exclude,
                    ...guess.types
                        .filter((type) => !type.isFound)
                        .map((type) => type.name),
                ],
            };
        },
        { include: [], exclude: [] }
    );

    const amountOfTypes =
        pokemon &&
        guesses.some((guess) => guess.types.length === 1) &&
        pokemon.types?.length;

    return {
        include: {
            generations: generations.include,
            types: types.include,
            pokemon: [],
        },
        exclude: {
            generations: generations.exclude,
            types: types.exclude,
            pokemon: guesses.map((guess) => guess?.name?.english),
        },
        amountOfTypes,
    };
};

export const getFilterFromGuess = (guess, pokemon) => {
    const { proximity } = determineGeneration(guess, pokemon);
    const generations = {
        include: proximity === 'correct' ? [getGeneration(guess)] : [],
        exclude: proximity !== 'correct' ? [getGeneration(guess)] : [],
    };
    const types = {
        include: guess.types
            .filter((type) => type.isFound)
            .map((type) => type.name),
        exclude: guess.types
            .filter((type) => !type.isFound)
            .map((type) => type.name),
    };

    const amountOfTypes =
        pokemon && guess.types.length === 1 && pokemon.types?.length;

    const includeMonoType = amountOfTypes && pokemon.types?.length === guess.types.length ? ['X'] : [];
    const excludeMonoType = amountOfTypes && pokemon.types?.length !== guess.types.length ? ['X'] : [];

    return {
        include: {
            generations: generations.include,
            types: [...types.include, ...includeMonoType],
            pokemon: [],
        },
        exclude: {
            generations: generations.exclude,
            types: [...types.exclude, ...excludeMonoType],
            pokemon: [guess.name ?? guess],
        },
        amountOfTypes,
    };
};

const convertToSet = (arr) => Array.from(new Set(arr));

export function mergeFilterStates(prevFilterState, nextFilterState) {
    return {
        include: {
            generations: convertToSet([
                ...prevFilterState.include.generations.filter(gen => !nextFilterState.exclude.generations.includes(gen)),
                ...nextFilterState.include.generations,
            ]),
            types: convertToSet([
                ...prevFilterState.include.types.filter(type => !nextFilterState.exclude.types.includes(type)),
                ...nextFilterState.include.types,
            ]),
            pokemon: convertToSet([
                ...prevFilterState.include.pokemon,
                ...nextFilterState.include.pokemon,
            ]),
        },
        exclude: {
            generations: convertToSet([
                ...prevFilterState.exclude.generations.filter(gen => !nextFilterState.include.generations.includes(gen)),
                ...nextFilterState.exclude.generations,
            ]),
            types: convertToSet([
                ...prevFilterState.exclude.types.filter(type => !nextFilterState.include.types.includes(type)),
                ...nextFilterState.exclude.types,
            ]),
            pokemon: convertToSet([
                ...prevFilterState.exclude.pokemon,
                ...nextFilterState.exclude.pokemon,
            ]),
        },
        amountOfTypes:
            nextFilterState?.amountOfTypes || prevFilterState?.amountOfTypes,
    };
}


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
                [types.name]: type.isFound,
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
