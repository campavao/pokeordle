import './Guess.scss';

export default function Guess(props) {
    const { guess, pokemon } = props;
    const { name, types, baseTotal } = guess;

    const baseTotalClass =
        baseTotal.difference < 20
            ? 'correct'
            : baseTotal.difference < 100
            ? 'almost'
            : 'absent';

    const typesElement = types.map((type) => {
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
                {type.name} {type.isFound ? 'is' : 'is not'} the same.{' '}
            </div>
        );
    });
    return (
        <div className="guess" key={name}>
            <div className="name">{name}</div>
            <div className="types-container">
                Types: {typesElement} out of {pokemon.type.length} possible
                types.
            </div>
            <div className={`base-total ${baseTotalClass}`}>
                Base total: {baseTotal.total}
            </div>
        </div>
    );
}
