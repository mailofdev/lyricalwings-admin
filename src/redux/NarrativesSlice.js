// NarrativesSlice.js
import createGenericSlice from './createGenericSlice';

const NarrativesSlice = createGenericSlice('Narrativess', 'NarrativesData', 'type');

export const {
  reducer: NarrativesReducer,
  actions: NarrativesActions,
} = NarrativesSlice;

export const {
  fetchCounts: fetchNarrativessCounts,
  fetchItems: fetchNarrativess,
  addItem: addNarrativess,
  updateItem: updateNarrativess,
  deleteItem: deleteNarrativess,
  deleteAllItems: deleteAllNarrativess,
  clearError,
} = NarrativesActions;