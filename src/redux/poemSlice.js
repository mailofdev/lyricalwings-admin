// poemSlice.js
import createGenericSlice from './createGenericSlice';

const poemSlice = createGenericSlice('poems', 'PoemData', 'type');

export const {
  reducer: poemReducer,
  actions: poemActions,
} = poemSlice;

export const {
  fetchCounts: fetchPoemCounts,
  fetchItems: fetchPoems,
  addItem: addPoem,
  updateItem: updatePoem,
  deleteItem: deletePoem,
  deleteAllItems: deleteAllPoems,
  clearError,
} = poemActions;