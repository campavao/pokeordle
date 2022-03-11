export default function TypeList(props) {
    const { guesses } = props;
    let foundTypes = [];
    const typeSet = new Set(
        guesses
            .map((guess) =>
                guess.types.map((type) => {
                    if (type.isFound) {
                        foundTypes = [...foundTypes, type.name];
                    }
                    return type.name;
                })
            )
            .flat()
    );
    const typeList = Array.from(typeSet).sort((a, b) => b - a);

    return (
        <ul className="type-list">
            {typeList.map((type) => {
                return (
                    <li
                        key={type}
                        className={`type-list-item ${
                            foundTypes.includes(type) ? 'correct-type' : ''
                        }`}
                    >
                        {type}
                    </li>
                );
            })}
        </ul>
    );
}
