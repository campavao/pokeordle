import { Button, Modal, Form } from 'react-bootstrap';
import { useState, useCallback, useEffect } from 'react';
import ReactGA from 'react-ga4';
import { FILTER_TYPES, GENERATIONS, EVOLUTION_STAGES } from '../constants';

import './TypeFilter.scss';

export function FilterContainer({
    filterState,
    updateFilterState: setFilterState,
}) {
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        ReactGA.event({
            category: 'Filter',
            action: showFilter ? 'Show' : 'Hide',
        });
    }, [showFilter]);

    const updateFilterState = useCallback(
        (newFilterState, filterType) => {
            setFilterState(newFilterState, filterType);

            ReactGA.event({
                category: 'Filter',
                action: 'Update',
                label: filterType,
            });
        },
        [setFilterState]
    );

    return (
        <div className="filter">
            <Button variant="secondary" onClick={() => setShowFilter(true)}>
                Filter
            </Button>
            <Modal show={showFilter} onHide={() => setShowFilter(false)}>
                <Modal.Header closeButton>
                    <strong>Filter</strong>
                </Modal.Header>
                <Modal.Body>
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
                    <div className="filter-row">
                        <p>Evolutions:</p>
                        <EvolutionFilter
                            filterState={filterState}
                            updateFilterState={updateFilterState}
                        />
                    </div>
                    <div className="bst-row">
                        <div>
                            <div className="bst">
                                <p>Base Stat Total: </p>
                                {filterState.bst && (
                                    <button
                                        onClick={() =>
                                            updateFilterState({
                                                bst: undefined,
                                            })
                                        }
                                        className={`type-list-item correct-type bst-type`}
                                    >
                                        {filterState.bst}
                                    </button>
                                )}
                            </div>
                            <Form.Range
                                max={800}
                                min={100}
                                onChange={(e) =>
                                    updateFilterState({
                                        bst: Number(e?.target?.value),
                                    })
                                }
                            />
                        </div>
                        {filterState.bst && (
                            <div className="bst">
                                <button
                                    onClick={() =>
                                        updateFilterState({
                                            bstMod: 20,
                                        })
                                    }
                                    className={`type-list-item bst-type ${
                                        filterState.bstMod === 20
                                            ? 'correct-type'
                                            : 'absent-type'
                                    }`}
                                >
                                    +/- 20
                                </button>
                                <button
                                    onClick={() =>
                                        updateFilterState({
                                            bstMod: 100,
                                        })
                                    }
                                    className={`type-list-item bst-type ${
                                        filterState.bstMod === 100
                                            ? 'correct-type'
                                            : 'absent-type'
                                    }`}
                                >
                                    +/- 100
                                </button>
                            </div>
                        )}
                    </div>
                </Modal.Body>
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
        const previousFilter = filterState[key][filterType] ?? [];
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
                <Button
                    style={{ padding: 0 }}
                    variant="outline"
                    onClick={showModal}
                    value="include"
                >
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
                <Button
                    style={{ padding: 0 }}
                    variant="outline"
                    onClick={showModal}
                    value="exclude"
                >
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
            <Modal show={filterKey} onHide={() => setFilterKey(undefined)}>
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

export function EvolutionFilter(props) {
    const EvoRows = ({ list = [], onClick, exclude = [], disabled = [] }) => {
        return (
            <div className="type-rows">
                {list.map((item) => (
                    <button
                        key={'evo-' + item}
                        onClick={onClick}
                        className={`type-list-item ${
                            exclude.includes(item) || disabled.includes(item)
                                ? 'absent-type'
                                : 'correct-type'
                        }`}
                        disabled={disabled.includes(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Filter
            {...props}
            filterType="evolutions"
            listComponent={EvoRows}
            options={EVOLUTION_STAGES}
        />
    );
}
