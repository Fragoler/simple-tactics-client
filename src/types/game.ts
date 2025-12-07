import { Unit } from '@/types/unit'
import { ActionDefinition } from './action'
 
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'


export interface GameState {
  units: Unit[]
  players: Player[]
  map: MapState
}


export interface MapState {
  name: string
  
  width: number
  height : number

  terrain : number[][]
}

export interface Player {
  playerId: number
  playerName: string
  isReady: boolean
}

export interface LogEntry {
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
}
