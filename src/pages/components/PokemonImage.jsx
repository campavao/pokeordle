export function PokemonImage({pokemon, isHint}) {
    return (
        <div
            className={isHint ? "game-hint" : "game-answer"}
            style={{
                backgroundImage: `url(${
                    pokemon.imgUrl ?? pokemon.img?.default
                })`,
            }}
        />
    )
}