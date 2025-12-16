// Excalidraw Board Components
export { ExcalidrawBoard } from './ExcalidrawBoard'
export type { 
  ExcalidrawBoardProps, 
  ExcalidrawBoardRef, 
  ExcalidrawSnapshot 
} from './ExcalidrawBoard'

// Export Menu
export { ExportMenu } from './ExportMenu'
export type { ExportMenuProps } from './ExportMenu'

// Board Initialization
export { 
  initializeProjectBoard,
  initializeProjectBoardWithImages,
  shouldInitializeBoard,
  mergeProjectDataWithBoard,
  getBoardSummary,
} from './initializeProjectBoard'
export type { InitializeBoardOptions } from './initializeProjectBoard'

// Legacy tldraw exports (deprecated - will be removed)
export { CoreRenderBoard, useBoardSnapshot } from './CoreRenderBoard'
export type { CoreRenderBoardProps } from './CoreRenderBoard'
