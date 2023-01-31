import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';

import { getImgUrl, getBaseStats } from './components/utils';

import { GENERATIONS } from './constants';

import * as pokedexJson from './pokedex.json';
import './Pokedex.scss';

function Pokedex() {
    const [page, setPage] = useState({ start: 0, limit: 151, gen: 1 });
    const [images, setImages] = useState([]);
    const [pokemon, setPokemon] = useState(undefined);
    const [show, setShow] = useState(false);

    const updateImages = useCallback(async ({ start, limit }) => {
        const arr =
            limit >= 905
                ? Array.from(pokedexJson)
                      .filter((_, index) => start <= index && index < limit)
                      .map((poke) => ({ default: poke.imgUrl }))
                : await Promise.all(
                      Array.from(pokedexJson)
                          .filter((_, index) => start <= index && index < limit)
                          .map(({ id }) => {
                              return getImgUrl(id);
                          })
                  );
        setImages(arr);
    }, []);

    useEffect(() => {
        if (!images.length && show) {
            updateImages(page);
        }
    }, [images, page, show, updateImages]);

    const changeGeneration = async (amount) => {
        setShow(false);
        const currentIndex = page.gen - 1;
        let updatePage = {};

        // I hate this logic with my entire being, but I can't figure out a cleaner way to do this
        if (amount === 1) {
            const limitIndex = page.gen;
            const startRange = GENERATIONS[currentIndex].range;
            const limitRange = GENERATIONS[limitIndex].range;
            updatePage = {
                start: startRange,
                limit: limitRange,
                gen: page.gen + 1,
            };
        } else {
            const limitIndex = currentIndex - 1;
            const startRange =
                limitIndex === 0 ? 0 : GENERATIONS[limitIndex - 1].range;
            const limitRange = GENERATIONS[currentIndex - 1].range;
            updatePage = {
                start: startRange,
                limit: limitRange,
                gen: page.gen - 1,
            };
        }
        setImages([]);
        setPage(updatePage);
    };

    const showPokemon = (index) => {
        setPokemon(pokedexJson[page.start + index]);
    };

    return (
        <div className="pokedex-container">
            <div className="nav">
                <button
                    onClick={() => changeGeneration(-1)}
                    disabled={page.gen === 1}
                >
                    Prev
                </button>
                Current Gen {page.gen}
                <button
                    onClick={() => changeGeneration(1)}
                    disabled={page.gen === GENERATIONS.length}
                >
                    Next
                </button>
            </div>
            <Button
                onClick={() => setShow(!show)}
                style={{ width: '100%' }}
                className="select-view-item "
            >
                Show
            </Button>
            {pokemon && (
                <Modal show backdrop onHide={() => setPokemon(undefined)}>
                    <div className="pokemodal">
                        {pokemon.name.english}
                        <div>Types: {pokemon.type.join(', ')}</div>
                        <div>Base Stat Total: {getBaseStats(pokemon)}</div>
                    </div>
                </Modal>
            )}
            {images.map((img, index) => {
                return (
                    <button
                        key={index}
                        className="entry"
                        style={{
                            backgroundImage: `url("${img.default}")`,
                        }}
                        onClick={() => showPokemon(index)}
                    />
                );
            })}
        </div>
    );
}

export default Pokedex;
