export {
  selectActiveBoard,
  selectActiveBoardColumns,
  selectActiveBoardTasks,
  selectActiveBoardState,
} from './model/selectors'
export type { ActiveBoardState } from './model/selectors'
export { useBoards } from './model/useBoards'
export { BoardSelector } from './ui/BoardSelector'
export {
  buildBoardPath,
  resolveFallbackBoardId,
  resolveRouteBoardId,
} from './model/routing'
export type { BoardViewRoute } from './model/routing'
export type { Board, BoardId } from '@/shared/api'
