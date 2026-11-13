import { createContext, useContext, useState, useCallback } from 'react'

const ScrollStageContext = createContext({
  sections: [],
  activeIndex: 0,
  setActive: () => {},
})

export function ScrollStageProvider({ sections = [], children }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const setActive = useCallback((i) => setActiveIndex(i), [])
  return (
    <ScrollStageContext.Provider value={{ sections, activeIndex, setActive }}>
      {children}
    </ScrollStageContext.Provider>
  )
}

export function useScrollStage() {
  return useContext(ScrollStageContext)
}
