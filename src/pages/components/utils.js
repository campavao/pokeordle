export const getIntWithinRange = (input, min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(input * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
};

export const filterSuggestions = (pokemon, guesses, genCap) =>
    pokemon.id <= genCap &&
    !guesses.find((guess) => guess.index.id === pokemon.id);

export const getBaseStats = (guessPokemon) => {
    const { hp, attack, defense, spAttack, spDefense, speed } =
        guessPokemon.base;
    return hp + attack + defense + spAttack + spDefense + speed;
};

export const getImg = async (pokemon) => {
    const index = pokemon.id;
    if (!index) return;
    const imgNum =
        index < 10 ? `00${index}` : index < 100 ? `0${index}` : index;
    const imgSrc = await import(`../../data/images/${imgNum}.png`);
    return {
        ...pokemon,
        img: imgSrc,
    };
};
