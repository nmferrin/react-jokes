import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Joke from './Joke';
import './JokeList.css';

/** List of jokes. */
function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getJokes = useCallback(async () => {
    try {
      let newJokes = [];
      let seenJokes = new Set(jokes.map(j => j.id));

      while (newJokes.length < numJokesToGet) {
        const res = await axios.get('https://icanhazdadjoke.com', {
          headers: { Accept: 'application/json' }
        });
        const { id, joke } = res.data;

        if (!seenJokes.has(id)) {
          seenJokes.add(id);
          newJokes.push({ id, joke, votes: 0 });
        } else {
          console.log('duplicate found!');
        }
      }

      setIsLoading(false);
      setJokes(prevJokes => [...prevJokes, ...newJokes]);
    } catch (err) {
      console.error(err);
    }
  }, [numJokesToGet]);

  useEffect(() => {
    getJokes();
  }, [getJokes]);

  const generateNewJokes = useCallback(() => {
    setIsLoading(true);
    setJokes([]);
    getJokes();
  }, [getJokes]);

  const vote = useCallback((id, delta) => {
    setJokes(jokes =>
      jokes.map(joke =>
        joke.id === id ? { ...joke, votes: joke.votes + delta } : joke
      )
    );
  }, []);

  const sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    );
  }

  return (
    <div className="JokeList">
      <button className="JokeList-getmore" onClick={generateNewJokes}>
        Get New Jokes
      </button>

      {sortedJokes.map(j => (
        <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={vote} />
      ))}
    </div>
  );
}

export default JokeList;

