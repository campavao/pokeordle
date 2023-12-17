import types from './components/types.json';

export const START_DATE = new Date('3/15/2022').setHours(0, 0, 0, 0);
export const TODAY_DATE = new Date().setHours(0, 0, 0, 0);
export const FILTER_TYPES = types.map((type) => type.english);

export const GENERATIONS = [
    {
        gen: 1,
        range: 151,
    },
    {
        gen: 2,
        range: 251,
    },
    {
        gen: 3,
        range: 386,
    },
    {
        gen: 4,
        range: 493,
    },
    {
        gen: 5,
        range: 649,
    },
    {
        gen: 6,
        range: 721,
    },
    {
        gen: 7,
        range: 809,
    },
    {
        gen: 8,
        range: 905,
    },
    {
        gen: 9,
        range: 1008,
    },
];

export const DEFAULT_FILTER = {
    types: { include: [], exclude: [] },
};

export const DEFAULT_FILTER_STATE = {
    include: {
        pokemon: [],
        generations: [],
        types: [],
    },
    exclude: {
        pokemon: [],
        generations: [],
        types: [],
    },
    bstMod: 20,
};
