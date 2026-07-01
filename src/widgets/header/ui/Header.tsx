import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from '@/shared/i18n'
import {
  buildBoardPath,
  resolveFallbackBoardId,
  useBoards,
} from '@/entities/board'
import { BoardManagement } from '@/features/board-management'
import { LanguageSwitcher } from '@/features/language-switcher'
import { ThemeSwitcher } from '@/features/theme-switcher'
import { AppIcon, Dialog, IconButton, Tooltip } from '@/shared/ui'
import styles from './Header.module.css'

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { boards, activeBoardId } = useBoards()
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false)

  const currentView = location.pathname.startsWith('/calendar') ? 'calendar' : 'board'
  const currentBoardId = resolveFallbackBoardId(boards, activeBoardId)

  const navItems = currentBoardId
    ? [
        { to: buildBoardPath('board', currentBoardId), label: 'nav.board', end: false },
        { to: buildBoardPath('calendar', currentBoardId), label: 'nav.calendar', end: false },
      ]
    : []

  const handleBoardChange = (boardId: string) => {
    navigate(buildBoardPath(currentView, boardId))
  }

  return (
    <header className={styles.header}>
      <div className={styles.primary}>
        <AppIcon />
        <BoardManagement
          className={styles.boardSelector}
          onBoardChange={handleBoardChange}
        />
      </div>
      <div className={styles.secondary}>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={styles.navLink}
            >
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <div className={styles.mobileActions}>
          <Tooltip text={t('header.mobile_settings')}>
            <IconButton
              icon={<Settings2 size={16} />}
              label={t('header.mobile_settings')}
              onClick={() => setIsMobileSettingsOpen(true)}
            />
          </Tooltip>
        </div>
      </div>
      {isMobileSettingsOpen && (
        <Dialog
          open={true}
          onClose={() => setIsMobileSettingsOpen(false)}
          title={t('header.mobile_settings')}
          closeLabel={t('dialog.close')}
        >
          <div className={styles.mobileSettingsPanel}>
            <div className={styles.mobileSettingGroup}>
              <span className={styles.mobileSettingLabel}>{t('header.theme')}</span>
              <ThemeSwitcher />
            </div>
            <div className={styles.mobileSettingGroup}>
              <span className={styles.mobileSettingLabel}>{t('header.language')}</span>
              <LanguageSwitcher />
            </div>
          </div>
        </Dialog>
      )}
    </header>
  )
}
