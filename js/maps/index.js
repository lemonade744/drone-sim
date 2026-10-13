import { meadow } from './meadow.js';
import { city } from './city.js';
import { canyon } from './canyon.js';
import { night } from './night.js';
import { islands } from './islands.js';
import { desert } from './desert.js';
import { forest } from './forest.js';
import { snow } from './snow.js';
import { volcano } from './volcano.js';
import { skyscrapers } from './skyscrapers.js';
import { labyrinth } from './labyrinth.js';
import { randomCity } from './randomCity.js';
import { randomMeadow } from './randomMeadow.js';
import { randomMountains } from './randomMountains.js';
import { randomDesert } from './randomDesert.js';
import { randomForest } from './randomForest.js';

export const maps = {
  meadow:      { ...meadow,      key: 'meadow' },
  forest:      { ...forest,      key: 'forest' },
  islands:     { ...islands,     key: 'islands' },
  canyon:      { ...canyon,      key: 'canyon' },
  labyrinth:   { ...labyrinth,   key: 'labyrinth' },
  volcano:     { ...volcano,     key: 'volcano' },
  desert:      { ...desert,      key: 'desert' },
  snow:        { ...snow,        key: 'snow' },
  city:        { ...city,        key: 'city' },
  night:       { ...night,       key: 'night' },
  skyscrapers: { ...skyscrapers, key: 'skyscrapers' },
  randomMeadow:    { ...randomMeadow,    key: 'randomMeadow' },
  randomForest:    { ...randomForest,    key: 'randomForest' },
  randomCity:      { ...randomCity,      key: 'randomCity' },
  randomMountains: { ...randomMountains, key: 'randomMountains' },
  randomDesert:    { ...randomDesert,    key: 'randomDesert' },
};