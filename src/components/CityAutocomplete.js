import React from 'react';
import Autocomplete from './Autocomplete';
import { CITIES } from '../data/cities';

export default function CityAutocomplete(props) {
  return <Autocomplete {...props} options={CITIES} icon="📍" />;
}
