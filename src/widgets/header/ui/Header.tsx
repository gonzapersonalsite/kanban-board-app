import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { DEFAULT_LOCALE, extractPathLocale, stripLocalePrefix, useTranslation } from '@/shared/i18n'
import { buildBoardPath, resolveFallbackBoardId, useBoards } from '@/entities/board'
import { BoardManagement } from '@/features/board-management'
import { DataExportSection, DataImportSection } from '@/features/data-portability'
import { LanguageSwitcher } from '@/features/language-switcher'
import { ThemeSwitcher } from '@/features/theme-switcher'
import { AppIcon, Credits, Dialog, IconButton, Tooltip } from '@/shared/ui'
import styles from './Header.module.css'

export function Header() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { boards, activeBoardId } = useBoards()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const routeLocale = extractPathLocale(location.pathname) ?? DEFAULT_LOCALE
  const currentView = stripLocalePrefix(location.pathname).startsWith('/calendar') ? 'calendar' : 'board'
  const currentBoardId = resolveFallbackBoardId(boards, activeBoardId)

  const navItems = currentBoardId
    ? [
        { to: buildBoardPath('board', currentBoardId, routeLocale), label: 'nav.board', end: false },
        { to: buildBoardPath('calendar', currentBoardId, routeLocale), label: 'nav.calendar', end: false },
      ]
    : []

  const handleBoardChange = (boardId: string) => {
    navigate(buildBoardPath(currentView, boardId, routeLocale))
  }

  const handleImportComplete = (activeBoardId: string | null) => {
    if (!activeBoardId) {
      return
    }

    navigate(buildBoardPath(currentView, activeBoardId, routeLocale), { replace: true })
    setIsSettingsOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.primary}>
        <div className={styles.brandMark}>
          <AppIcon />
        </div>
        <BoardManagement className={styles.boardSelector} onBoardChange={handleBoardChange} />
      </div>
      <div className={styles.secondary}>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={styles.navLink}>
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <div className={styles.settingsAction}>
          <Tooltip text={t('header.settings')}>
            <IconButton icon={<Settings2 />} label={t('header.settings')} onClick={() => setIsSettingsOpen(true)} />
          </Tooltip>
        </div>
      </div>
      {isSettingsOpen && (
        <Dialog
          open={true}
          onClose={() => setIsSettingsOpen(false)}
          title={t('header.settings')}
          closeLabel={t('dialog.close')}
        >
          <div className={styles.settingsPanel}>
            <div className={styles.settingGroup}>
              <span className={styles.settingLabel}>{t('header.theme')}</span>
              <ThemeSwitcher />
            </div>
            <div className={styles.settingGroup}>
              <span className={styles.settingLabel}>{t('header.language')}</span>
              <LanguageSwitcher />
            </div>
            <DataExportSection />
            <DataImportSection onImportComplete={(state) => handleImportComplete(state.activeBoardId)} />
            <section className={styles.creditsSection} aria-labelledby="settings-credits-title">
              <h3 id="settings-credits-title" className={styles.creditsTitle}>
                {t('credits.title')}
              </h3>
              <Credits />
            </section>
          </div>
        </Dialog>
      )}
    </header>
  )
}
