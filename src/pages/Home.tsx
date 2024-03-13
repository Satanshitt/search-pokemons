import React, { useState } from "react";

interface PokemonData {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: { ability: { name: string } }[];
}

interface ErrorAlertProps {
  text: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ text }) => {
  return (
    <div className="flex flex-row items-center w-full gap-x-1 text-[#fc526a]">
      <i className="bi bi-exclamation-triangle-fill text-base"></i>
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default function Home() {
  const [searchCriteria, setSearchCriteria] = useState("");
  const [pokemonData, setPokemonData] = useState<PokemonData[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [err, setErr] = useState(0);

  const handleSearchClick = () => {
    const [criteria, searchValue] = searchCriteria.split(":");

    switch (criteria) {
      case "nombre":
        fetchPokemonByName(searchValue.toLowerCase());
        break;
      case "id":
        fetchPokemonById(parseInt(searchValue));
        break;
      case "altura":
        fetchPokemonByHeightRange(searchValue);
        break;
      case "peso":
        fetchPokemonByWeightRange(searchValue);
        break;
      case "habilidad":
        fetchPokemonByAbility(searchValue.toLowerCase());
        break;
      default:
        setErr(2);
        return;
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCriteria(event.target.value);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPokemonData([]);
  };

  const fetchPokemonByName = (name: string) => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((response) => response.json())
      .then((data) => {
        setPokemonData([data]);
        setShowModal(true);
        setErr(0);
      })
      .catch((error) => {
        console.error("Error fetching Pokemon data:", error);
        setErr(1);
        setPokemonData([]);
      });
  };

  const fetchPokemonById = (id: number) => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setPokemonData([data]);
        setShowModal(true);
        setErr(0);
      })
      .catch((error) => {
        console.error("Error fetching Pokemon data:", error);
        setErr(1);
        setPokemonData([]);
      });
  };

  const fetchPokemonByHeightRange = (height: string) => {
    const targetHeight = parseInt(height.split(":")[0]);

    fetch("https://pokeapi.co/api/v2/pokemon?limit=200")
      .then((response) => response.json())
      .then((data) => {
        const promises = data.results.map((result: any) =>
          fetch(result.url).then((response) => response.json())
        );

        Promise.all(promises)
          .then((pokemonList: PokemonData[]) => {
            const filteredPokemon = pokemonList.filter(
              (pokemon: PokemonData) =>
                parseInt(pokemon.height.toString()) === targetHeight
            );
            handleFilteredPokemon(filteredPokemon);
          })
          .catch((error) => {
            console.error("Error fetching Pokemon data:", error);
            handleFilteredPokemon([]);
          });
      })
      .catch((error) => {
        console.error("Error fetching Pokemon data:", error);
        handleFilteredPokemon([]);
      });
  };

  const fetchPokemonByWeightRange = (weight: string) => {
    const targetWeight = parseInt(weight.split(":")[0]);

    fetch("https://pokeapi.co/api/v2/pokemon?limit=200")
      .then((response) => response.json())
      .then((data) => {
        const promises = data.results.map((result: any) =>
          fetch(result.url).then((response) => response.json())
        );

        Promise.all(promises)
          .then((pokemonList: PokemonData[]) => {
            const filteredPokemon = pokemonList.filter(
              (pokemon: PokemonData) =>
                parseInt(pokemon.weight.toString()) === targetWeight
            );
            handleFilteredPokemon(filteredPokemon);
          })
          .catch((error) => {
            console.error("Error fetching Pokemon data:", error);
            handleFilteredPokemon([]);
          });
      })
      .catch((error) => {
        console.error("Error fetching Pokemon data:", error);
        handleFilteredPokemon([]);
      });
  };

  const handleFilteredPokemon = (filteredPokemon: PokemonData[]) => {
    if (filteredPokemon.length > 0) {
      setPokemonData(filteredPokemon);
      setShowModal(true);
      setErr(0);
    } else {
      setErr(1);
      setShowModal(true);
      setPokemonData([]);
    }
  };

  const fetchPokemonByAbility = (abilityName: string) => {
    fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`)
      .then((response) => response.json())
      .then((data) => {
        const promises = data.pokemon.map((pokemon: any) =>
          fetch(pokemon.pokemon.url).then((response) => response.json())
        );

        Promise.all(promises)
          .then((pokemonList) => {
            setPokemonData(pokemonList);
            setShowModal(true);
            setErr(0);
          })
          .catch((error) => {
            console.error("Error fetching Pokemon data:", error);
            setErr(1);
            setPokemonData([]);
          });
      })
      .catch((error) => {
        console.error("Error fetching Pokemon data:", error);
        setErr(1);
        setPokemonData([]);
      });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="p-4">
        <h1 className="text-xl text-center mb-5">Busca un Pokémon</h1>
        <input
          type="text"
          value={searchCriteria}
          onChange={handleInputChange}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center"
          placeholder="Ingresa tu pokémon aquí"
        />
        <button
          onClick={handleSearchClick}
          className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Buscar Pokémon
        </button>

        {err === 1 && (
          <ErrorAlert
            text={"No se ha encontrado ese Pokemon, intentalo de nuevo."}
          />
        )}
        {err === 2 && (
          <ErrorAlert
            text={"Criterio de búsqueda no válido. Intenta de nuevo."}
          />
        )}

        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto bg-gray-100">
            <div className="flex items-center justify-center min-h-screen p-8">
              <div className="relative bg-white p-12 rounded-lg">
                {pokemonData.length > 0 ? (
                  <div>
                    {pokemonData.map((pokemon) => (
                      <div key={pokemon.id}>
                        <h1 className="text-2xl font-semibold pt-5 mb-1">
                          {pokemon.name}
                        </h1>
                        <p>ID: {pokemon.id}</p>
                        <p>Altura: {pokemon.height}</p>
                        <p>Peso: {pokemon.weight}</p>
                        {pokemon.abilities.length > 0 && (
                          <div>
                            <h2 className="pt-5 font-bold">Habilidades:</h2>
                            <ul>
                              {pokemon.abilities.map((ability, index) => (
                                <li key={index}>- {ability.ability.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>
                    No se encontraron Pokémon que coincidan con los criterios de
                    búsqueda.
                  </p>
                )}
                <button
                  onClick={handleCloseModal}
                  className="absolute top-0 right-0 m-4 p-2 text-gray-500 hover:text-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
