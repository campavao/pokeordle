import { useMemo } from 'react';

import './Guess.scss';

export default function TypeList(props) {
    const {
        types = [],
        useTypeColors = true,
        possibleTypes,
        justShow = true,
        enableSuperEffective = false,
        strong = false,
    } = props;
    let foundTypes = [];

    const superEffective = useMemo(
        () =>
            types.reduce((accumulator, value) => {
                const name = value.name;
                return {
                    ...accumulator,
                    [name]: (accumulator[name] || 0) + 1,
                };
            }, {}),
        [types]
    );

    const typeSet = new Set(
        types
            .map((type) => {
                if (type?.isFound || justShow) {
                    foundTypes = [...foundTypes, type];
                }
                return type?.name;
            })
            .flat()
    );
    const typeList = Array.from(typeSet);
    const isTypeMissed = (type) => {
        return foundTypes.findIndex((foundType) => foundType.name === type) > -1
            ? ''
            : 'miss';
    };

    if (possibleTypes && typeList.length < 2) {
        typeList.push(possibleTypes === 1 ? 'X' : '?');
    }

    return (
        <ul className="type-list">
            {typeList
                .sort((a, b) =>
                    superEffective[a] > superEffective[b] ? -1 : 1
                )
                .map((type) => {
                    const foundType = foundTypes.find(
                        (foundType) => foundType.name === type
                    );
                    const typeClassName = useTypeColors
                        ? `${type?.toLowerCase()} ${isTypeMissed(type)}`
                        : foundType?.isSameIndex
                        ? 'correct-type'
                        : foundType?.isFound
                        ? 'almost-type'
                        : type === 'X'
                        ? 'correct-type'
                        : 'absent-type';

                    return (
                        <div>
                            {!enableSuperEffective
                                ? null
                                : superEffective[type] > 1
                                ? strong
                                    ? '1/4x'
                                    : '4x'
                                : strong
                                ? '1/2x'
                                : '2x'}
                            <li
                                key={type}
                                className={`type-list-item ${typeClassName}`}
                            >
                                {type !== 'X' ? (
                                    type?.toUpperCase()
                                ) : (
                                    <i
                                        class={`bi bi-${
                                            possibleTypes > 1
                                                ? 'question-lg'
                                                : 'x-lg'
                                        }`}
                                    ></i>
                                )}
                            </li>
                        </div>
                    );
                })}
        </ul>
    );
}
