import React from 'react';
import Autocomplete from './Autocomplete';
import { UNIVERSITIES } from '../data/universities';

export default function SchoolAutocomplete(props) {
  return <Autocomplete {...props} options={UNIVERSITIES} icon="🎓" />;
}
