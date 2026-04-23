import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import type { User } from '../domain/types'

export type AppState = {
  user: User
  actions: {
    setUser: (user: User) => void
  }
}

export const appStore = createStore<AppState>((set) => ({
  user: { id: '', name: 'Loading...' },
  actions: {
    setUser: (user) => set({ user })
  }
}))

export function useAppStore<T>(selector: (s: AppState) => T): T {
  return useStore(appStore, selector)
}

export const appStoreApi = {
  getState: appStore.getState,
  setState: appStore.setState,
  subscribe: appStore.subscribe,
  actions: () => appStore.getState().actions
}

