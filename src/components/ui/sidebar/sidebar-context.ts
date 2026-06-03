import * as React from 'react'

export interface SidebarContextValue {
  readonly collapsed: boolean
}

export const SidebarContext = React.createContext<SidebarContextValue>({ collapsed: false })
