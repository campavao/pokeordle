import './Guess.scss';

const generations = [
    {
        name: 'Gen 1',
        range: 151,
    },
    {
        name: 'Gen 2',
        range: 251,
    },
    {
        name: 'Gen 3',
        range: 386,
    },
    {
        name: 'Gen 4',
        range: 493,
    },
    {
        name: 'Gen 5',
        range: 649,
    },
    {
        name: 'Gen 6',
        range: 721,
    },
    {
        name: 'Gen 7',
        range: 809,
    },
];

export default function Guess(props) {
    const { guess, pokemon, showArrows = false, showId = false } = props;
    const { name, index, types, baseTotal } = guess;

    const determineProximity = (checkNum) => {
        return checkNum < 20 ? 'correct' : checkNum < 100 ? 'almost' : 'absent';
    };

    function Name() {
        const absIndexDifference = Math.abs(index.difference);
        const baseIndexClass = determineProximity(absIndexDifference);
        return (
            <div className="name">
                {name}
                {showId && (
                    <span className={baseIndexClass}>
                        #{index.id}{' '}
                        {showArrows && (
                            <i
                                className={`bi bi-arrow-${
                                    index.difference > 0 ? 'up' : 'down'
                                }`}
                            ></i>
                        )}
                    </span>
                )}
            </div>
        );
    }

    function Types() {
        return (
            <div className="types-container">
                Types:{' '}
                {types.map((type) => {
                    return (
                        <div
                            className={
                                type.isSameIndex
                                    ? 'correct'
                                    : type.isFound
                                    ? 'almost'
                                    : 'absent'
                            }
                        >
                            {type.name} {type.isFound ? 'is' : 'is not'} the
                            same.{' '}
                        </div>
                    );
                })}{' '}
                out of {pokemon.type.length} possible types.
            </div>
        );
    }

    function BaseTotal() {
        const absTotalDifference = Math.abs(baseTotal.difference);
        const baseTotalClass = determineProximity(absTotalDifference);
        return (
            <div className={`base-total ${baseTotalClass}`}>
                Base total: {baseTotal.total}{' '}
                {showArrows && (
                    <i
                        className={`bi bi-arrow-${
                            baseTotal.difference > 0 ? 'up' : 'down'
                        }`}
                    ></i>
                )}
            </div>
        );
    }

    function Generation() {
        const findGen = (gen, toFind) => {
            const foundIndex = toFind.index ? toFind.index : toFind;
            return foundIndex.id <= gen.range;
        };
        const guessGeneration = generations.find((gen) => findGen(gen, guess));
        const pokemonGeneration = generations.find((gen) =>
            findGen(gen, pokemon)
        );
        const difference = Math.abs(
            Number(guessGeneration.name.replace('Gen ', '')) -
                Number(pokemonGeneration.name.replace('Gen ', ''))
        );

        return (
            <div
                className={`generation ${
                    difference === 0
                        ? 'correct'
                        : difference === 1
                        ? 'almost'
                        : 'absent'
                }`}
            >
                {guessGeneration.name}
            </div>
        );
    }

    return (
        <div className="guess" key={name}>
            <Name />
            <Generation />
            <Types />
            <BaseTotal />
        </div>
    );
}
