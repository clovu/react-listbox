import type { PlaygroundSettings, ScenarioId } from './playground-data'
import {
  getMultiInitialValue,
  getScenarioById,
  getSingleInitialValue,
} from './playground-data'

export interface LabState {
  activeScenarioId: ScenarioId
  multiValues: string[]
  settings: PlaygroundSettings
  singleValue: string
}

export type LabAction
  = | { type: 'selectScenario', scenarioId: ScenarioId }
    | { type: 'resetScenario' }
    | { type: 'updateSettings', settings: PlaygroundSettings }
    | { type: 'setSingleValue', value: string }
    | { type: 'setMultiValues', values: string[] }

export function createLabState(scenarioId: ScenarioId): LabState {
  const scenario = getScenarioById(scenarioId)

  return {
    activeScenarioId: scenario.id,
    multiValues: getMultiInitialValue(scenario),
    settings: scenario.defaultSettings,
    singleValue: getSingleInitialValue(scenario),
  }
}

export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case 'selectScenario':
      return createLabState(action.scenarioId)
    case 'resetScenario':
      return createLabState(state.activeScenarioId)
    case 'updateSettings':
      return { ...state, settings: action.settings }
    case 'setSingleValue':
      return { ...state, singleValue: action.value }
    case 'setMultiValues':
      return { ...state, multiValues: action.values }
  }
}
