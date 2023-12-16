import './TypeFilter.scss';
import { Button, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';

import { FILTER_TYPES, GENERATIONS } from '../constants';

export function FilterContainer({ filterState, updateFilterState }) {
    const [showFilter, setShowFilter] = useState(false);

    return (
        <div className="filter">
            <Button variant="secondary" onClick={() => setShowFilter(true)}>
                Filter
            </Button>
            <Modal show={showFilter} onHide={() => setShowFilter(false)}>
                <div className="filter-row">
                    <p>Generation:</p>
                    <GenFilter
                        filterState={filterState}
                        updateFilterState={updateFilterState}
                    />
                </div>
                <div className="filter-row">
                    <p>Types:</p>
                    <TypeFilter
                        filterState={filterState}
                        updateFilterState={updateFilterState}
                    />
                </div>
                <div className="filter-row bst">
                    <div>
                        <p>Base Stat Total: </p>
                        {filterState.bst && (
                            <button
                                onClick={() =>
                                    updateFilterState({ bst: undefined })
                                }
                                className={`type-list-item correct-type bst-type`}
                            >
                                {filterState.bst - 20} - {filterState.bst + 20}
                            </button>
                        )}
                    </div>
                    <Form.Range
                        max={800}
                        min={100}
                        onChange={(e) =>
                            updateFilterState({ bst: Number(e?.target?.value) })
                        }
                        value={filterState.bst}
                    />
                </div>
            </Modal>
        </div>
    );
}

export function Filter(props) {
    const {
        filterState = {},
        updateFilterState,
        filterType,
        listComponent: ListComponent,
        options = [],
    } = props;
    const [filterKey, setFilterKey] = useState();
    const includeList = filterState.include[filterType];
    const excludeList = filterState.exclude[filterType];

    const onUpdate = (e, overrideKey) => {
        let value = e.target.outerText;
        if (filterType === 'generations') {
            value = Number.parseInt(value);
        }
        const key = overrideKey ?? filterKey;
        const previousFilter = filterState[key][filterType];
        const newFilterState = {
            ...filterState,
            [key]: {
                [filterType]: previousFilter.includes(value)
                    ? previousFilter.filter(
                          (filterType) => filterType !== value
                      )
                    : [...previousFilter, value],
            },
        };

        if (value === 'X') {
            if (!previousFilter.includes(value)) {
                newFilterState.amountOfTypes = key === 'include' ? 1 : 2;
            } else {
                newFilterState.amountOfTypes = false;
            }
        }

        updateFilterState(newFilterState, filterType);
        setFilterKey(undefined);
    };

    const showModal = (e) => {
        const newFilterKey = e.target.value;
        setFilterKey(newFilterKey);
    };

    return (
        <div className="type-filter">
            <div className="filter-column">
                <Button variant="outline" onClick={showModal} value="include">
                    Include +
                </Button>

                {includeList && (
                    <ListComponent
                        {...props}
                        onClick={(e) => onUpdate(e, 'include')}
                        list={includeList}
                        include={includeList}
                    />
                )}
            </div>
            <div className="filter-column">
                <Button variant="outline" onClick={showModal} value="exclude">
                    Exclude +
                </Button>

                {excludeList && (
                    <ListComponent
                        {...props}
                        onClick={(e) => onUpdate(e, 'exclude')}
                        list={excludeList}
                        exclude={excludeList}
                    />
                )}
            </div>
            <Modal show={filterKey} onHide={() => setFilterKey(undefined)} closeButton>
                <ListComponent
                    {...props}
                    onClick={onUpdate}
                    list={options}
                    include={options}
                    disabled={
                        filterKey === 'include' ? excludeList : includeList
                    }
                    exclude={
                        filterKey === 'include' ? excludeList : includeList
                    }
                />
            </Modal>
        </div>
    );
}

export function TypeFilter(props) {
    return (
        <Filter
            {...props}
            filterType="types"
            listComponent={TypeRows}
            options={FILTER_TYPES}
        />
    );
}

export function GenFilter(props) {
    const genNumbers = GENERATIONS.map(({ gen }) => gen);
    const GenRows = ({ list = [], onClick, exclude = [], disabled = [] }) => {
        return (
            <div className="type-rows">
                {list.map((gen) => (
                    <button
                        key={'gen-' + gen}
                        onClick={onClick}
                        className={`type-list-item ${
                            exclude.includes(gen) || disabled.includes(gen)
                                ? 'absent-type'
                                : 'correct-type'
                        }`}
                        disabled={disabled.includes(gen)}
                    >
                        {gen}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Filter
            {...props}
            filterType="generations"
            listComponent={GenRows}
            options={genNumbers}
        />
    );
}

function TypeRows({
    list = [],
    include = [],
    exclude = [],
    onClick,
    disabled = [],
}) {
    return (
        <div className="type-rows">
            {list.map((type, index) => {
                const isDisabled = disabled.includes(type);
                const isExcluded = exclude.includes(type) || isDisabled;
                const typeClassName = `
                ${(!include.includes(type) || isDisabled) && 'miss'}
                ${type.toLowerCase()}
                ${isExcluded && 'excluded'}`;

                return (
                    <button
                        key={type + index}
                        onClick={onClick}
                        className={`type-list-item ${typeClassName}`}
                        disabled={disabled.includes(type)}
                    >
                        {type}
                    </button>
                );
            })}
        </div>
    );
}
