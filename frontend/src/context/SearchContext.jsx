import { createContext, useState, useContext } from 'react';

// Hacking together the search context so the Topbar search bar
// actually does something useful — right now it's completely dead.
// This tiny context bridges Topbar (writer) → Trainees page (reader)
// without needing URL query params or a Redux store.
export const SearchContext = createContext();

export function SearchProvider({ children }) {
  // Single string that the whole app can read and write.
  // Keeping it simple — no debounce at the context level, components
  // can debounce locally if the data set grows large enough to need it.
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <SearchContext.Provider value={{ globalSearch, setGlobalSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

// Convenience hook — saves every consumer from importing both SearchContext and useContext
export function useSearch() {
  return useContext(SearchContext);
}
