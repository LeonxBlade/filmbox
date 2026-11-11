
import { Clapperboard, Moon } from 'lucide-react'

function Header({ kayitDurumu }) {
  return (
    <header className="site-header">
      <div className="brand">
        <div className="brand-icon">
          <Clapperboard size={24} />
        </div>

        <div>
          <h1>
            Film<span>Box</span>
          </h1>
          <p>Kişisel film arşivin, senin sineman.</p>
        </div>
      </div>

      <div className="header-right">
        <span className="header-label">
          <Moon size={16} />
          Cinema Mode
        </span>

        <span className="kayit-durumu">
          {kayitDurumu}
        </span>
      </div>
    </header>
  )
}

export default Header
