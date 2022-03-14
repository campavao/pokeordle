import './Guess.scss';

export default function TypeList(props) {
    const { types, useTypeColors = true, possibleTypes } = props;
    let foundTypes = [];
    const typeSet = new Set(
        types
            .map((type) => {
                if (type.isFound) {
                    foundTypes = [...foundTypes, type];
                }
                return type.name;
            })
            .flat()
    );
    const typeList = Array.from(typeSet).sort((a, b) => b - a);
    const isTypeMissed = (type) => {
        return foundTypes.findIndex((foundType) => foundType.name === type) > -1
            ? ''
            : 'miss';
    };

    if (possibleTypes && typeList.length < 2) {
        typeList.push('');
    }

    return (
        <ul className="type-list">
            {typeList.map((type, index) => {
                const foundType = foundTypes.find(
                    (foundType) => foundType.name === type
                );
                const typeClassName = useTypeColors
                    ? `${type.toLowerCase()} ${isTypeMissed(type)}`
                    : foundType?.isSameIndex
                    ? 'correct-type'
                    : foundType?.isFound
                    ? 'almost-type'
                    : index >= possibleTypes
                    ? 'mono-type'
                    : 'absent-type';

                return (
                    <li
                        key={type}
                        className={`type-list-item ${typeClassName}`}
                    >
                        {type !== '' ? (
                            type.toUpperCase()
                        ) : (
                            <i
                                class={`bi bi-${
                                    possibleTypes > 1 ? 'question-lg' : 'x-lg'
                                }`}
                            ></i>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
