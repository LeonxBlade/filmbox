import Header from './components/Header'
import { useState, useEffect, useRef } from 'react'
import {
  Film,
  Clapperboard,
  CheckCircle2,
  CirclePlay,
  Bookmark,
  Search,
  Plus,
  Trash2,
  Pencil,
  Upload,
  ListFilter,
  X,
  CalendarDays
} from 'lucide-react'
import './App.css'
import { tumFilmleriGetir, tumFilmleriKaydet } from './db'

const DURUMLAR = ['İzlemedim', 'İzledim', 'İzleme listemde']

function App() {
  const [filmler, setFilmler] = useState([])
  const [filmAdi, setFilmAdi] = useState('')
  const [manuelFilmAdi, setManuelFilmAdi] = useState('')
  const [listeArama, setListeArama] = useState('')
  const [durumFiltresi, setDurumFiltresi] = useState('Tümü')
  const [aramaSonuclari, setAramaSonuclari] = useState([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [posterDosyasi, setPosterDosyasi] = useState(null)
  const [veritabaniDurumu, setVeritabaniDurumu] = useState('yukleniyor')
  const [kayitHatasi, setKayitHatasi] = useState('')
  const [kayitBekliyor, setKayitBekliyor] = useState(false)
  const kayitSirasi = useRef(Promise.resolve())
  const kayitSayaci = useRef(0)

  useEffect(() => {
    let aktif = true

    async function yukle() {
      try {
        const kayitlar = await tumFilmleriGetir()
        const hazir = kayitlar.map(film => ({
          ...film,
          Poster: film.posterBlob instanceof Blob
            ? URL.createObjectURL(film.posterBlob)
            : film.Poster
        }))

        if (aktif) {
          setFilmler(hazir)
          setVeritabaniDurumu('hazir')
        }
      } catch (error) {
        console.error(error)
        if (aktif) {
          setKayitHatasi('Film arşivi yüklenemedi.')
          setVeritabaniDurumu('hata')
        }
      }
    }

    yukle()
    return () => { aktif = false }
  }, [])

  useEffect(() => {
    if (veritabaniDurumu !== 'hazir') return

    const sira = ++kayitSayaci.current
    setKayitBekliyor(true)

    kayitSirasi.current = kayitSirasi.current
      .catch(() => {})
      .then(() => tumFilmleriKaydet(filmler))
      .then(() => {
        if (sira === kayitSayaci.current) {
          setKayitHatasi('')
          setKayitBekliyor(false)
        }
      })
      .catch(error => {
        console.error(error)
        if (sira === kayitSayaci.current) {
          setKayitHatasi('Değişiklikler kaydedilemedi.')
          setKayitBekliyor(false)
        }
      })
  }, [filmler, veritabaniDurumu])

  async function filmAra(e) {
    e.preventDefault()
    if (!filmAdi.trim()) return

    setYukleniyor(true)
    setHata('')
    setAramaSonuclari([])

    try {
      const response = await fetch(
        `/.netlify/functions/omdb?s=${encodeURIComponent(filmAdi.trim())}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Film aranamadı.')
      }

      if (data.Response === 'False') {
        throw new Error(data.Error || 'Film bulunamadı.')
      }

      setAramaSonuclari(data.Search || [])
    } catch (error) {
      setHata(error.message || 'Bağlantı hatası oluştu.')
    } finally {
      setYukleniyor(false)
    }
  }

  function filmEkle(e) {
    e.preventDefault()
    const ad = manuelFilmAdi.trim()

    if (!ad) return

    if (filmler.some(film =>
      film.Title.toLocaleLowerCase('tr') === ad.toLocaleLowerCase('tr')
    )) {
      alert('Bu film zaten arşivinde!')
      return
    }

    setFilmler(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        Title: ad,
        Year: '',
        Poster: posterDosyasi
          ? URL.createObjectURL(posterDosyasi)
          : null,
        posterBlob: posterDosyasi || null,
        durum: 'İzlemedim'
      }
    ])

    setManuelFilmAdi('')
    setPosterDosyasi(null)
    e.currentTarget.reset()
  }

  function arananFilmiEkle(film) {
    if (filmler.some(item => item.imdbID === film.imdbID)) {
      alert('Bu film zaten arşivinde!')
      return
    }

    setFilmler(prev => [
      ...prev,
      {
        ...film,
        id: film.imdbID,
        durum: 'İzlemedim',
        posterBlob: null
      }
    ])

    setAramaSonuclari(prev =>
      prev.filter(item => item.imdbID !== film.imdbID)
    )
  }

  function filmSil(id) {
    if (!window.confirm('Bu filmi arşivinden silmek istiyor musun?')) return
    setFilmler(prev => prev.filter(film => film.id !== id))
  }

  function filmDuzenle(id) {
    const film = filmler.find(item => item.id === id)
    if (!film) return

    const ad = prompt('Yeni film adını gir:', film.Title)
    if (ad === null) return

    if (!ad.trim()) {
      alert('Film adı boş olamaz.')
      return
    }

    setFilmler(prev =>
      prev.map(item =>
        item.id === id ? { ...item, Title: ad.trim() } : item
      )
    )
  }

  function filmDurumuDegistir(id, durum) {
    setFilmler(prev =>
      prev.map(film =>
        film.id === id ? { ...film, durum } : film
      )
    )
  }

  function posterDegistir(id, dosya) {
    if (!dosya) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(dosya.type)) {
      alert('Yalnızca JPG, PNG veya WebP seçebilirsin.')
      return
    }

    if (dosya.size > 5 * 1024 * 1024) {
      alert('Afiş en fazla 5 MB olabilir.')
      return
    }

    setFilmler(prev =>
      prev.map(film =>
        film.id === id
          ? {
              ...film,
              Poster: URL.createObjectURL(dosya),
              posterBlob: dosya
            }
          : film
      )
    )
  }

  const izlenenSayisi = filmler.filter(f => f.durum === 'İzledim').length
  const izlenmeyenSayisi = filmler.filter(
    f => !f.durum || f.durum === 'İzlemedim'
  ).length
  const izlemeListesiSayisi = filmler.filter(
    f => f.durum === 'İzleme listemde'
  ).length

  const filtreler = [
    { ad: 'Tümü', sayi: filmler.length, Icon: Film },
    { ad: 'İzledim', sayi: izlenenSayisi, Icon: CheckCircle2 },
    { ad: 'İzlemedim', sayi: izlenmeyenSayisi, Icon: CirclePlay },
    { ad: 'İzleme listemde', sayi: izlemeListesiSayisi, Icon: Bookmark }
  ]

  const filtrelenmisFilmler = filmler.filter(film => {
    const arama = `${film.Title} ${film.Year || ''}`
      .toLocaleLowerCase('tr')
      .includes(listeArama.trim().toLocaleLowerCase('tr'))

    const durum = durumFiltresi === 'Tümü' ||
      (durumFiltresi === 'İzlemedim'
        ? !film.durum || film.durum === 'İzlemedim'
        : film.durum === durumFiltresi)

    return arama && durum
  })

  if (veritabaniDurumu !== 'hazir') {
    return (
      <div className="app">
        <h1>FilmBox</h1>
        <p>{veritabaniDurumu === 'hata'
          ? kayitHatasi
          : 'Film arşivin yükleniyor...'}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Header
        kayitDurumu={
          kayitHatasi ? 'Kayıt hatası' :
          kayitBekliyor ? 'Kaydediliyor...' : 'Otomatik kayıt açık'
        }
      />

      {kayitHatasi && <p className="hata-mesaji">{kayitHatasi}</p>}

      <section className="hero-panel">
        <div>
          <span className="eyebrow">KİŞİSEL FİLM KOLEKSİYONUN</span>
          <h2>Sinema dünyan, tek bir yerde.</h2>
          <p>İzlediklerini takip et, yeni filmler keşfet ve izleme listeni düzenle.</p>
        </div>
        <div className="hero-symbol"><Clapperboard size={70} /></div>
      </section>

      <div className="film-istatistikleri">
        <div className="istatistik-karti">
          <div className="istatistik-ikon"><Film size={22} /></div>
          <span>Toplam Film</span>
          <strong>{filmler.length}</strong>
        </div>

        <div className="istatistik-karti">
          <div className="istatistik-ikon"><CheckCircle2 size={22} /></div>
          <span>İzledim</span>
          <strong>{izlenenSayisi}</strong>
        </div>

        <div className="istatistik-karti">
          <div className="istatistik-ikon"><CirclePlay size={22} /></div>
          <span>İzlemedim</span>
          <strong>{izlenmeyenSayisi}</strong>
        </div>

        <div className="istatistik-karti">
          <div className="istatistik-ikon"><Bookmark size={22} /></div>
          <span>İzleme Listem</span>
          <strong>{izlemeListesiSayisi}</strong>
        </div>
      </div>

      <div className="ekleme-panelleri">
        <section className="panel">
          <div className="panel-baslik">
            <Search size={19} />
            <div>
              <h2>Film Keşfet</h2>
              <p>OMDb üzerinden film ara ve arşivine ekle.</p>
            </div>
          </div>

          <form className="panel-form" onSubmit={filmAra}>
            <input
              type="text"
              placeholder="Örn. Interstellar, Dune..."
              value={filmAdi}
              onChange={e => setFilmAdi(e.target.value)}
            />
            <button type="submit" disabled={yukleniyor}>
              <Search size={16} />
              {yukleniyor ? 'Aranıyor...' : 'Film Ara'}
            </button>
          </form>
          {hata && <p className="hata-mesaji">{hata}</p>}
        </section>

        <section className="panel">
          <div className="panel-baslik">
            <Plus size={19} />
            <div>
              <h2>Manuel Film Ekle</h2>
              <p>Filmini kendin ekle, istersen afiş yükle.</p>
            </div>
          </div>

          <form className="panel-form" onSubmit={filmEkle}>
            <input
              type="text"
              placeholder="Film adı..."
              value={manuelFilmAdi}
              onChange={e => setManuelFilmAdi(e.target.value)}
            />
            <label className="dosya-sec">
              <Upload size={15} />
              {posterDosyasi ? posterDosyasi.name : 'Afiş seç'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={e => setPosterDosyasi(e.target.files[0] || null)}
              />
            </label>
            <button type="submit"><Plus size={16} /> Ekle</button>
          </form>
        </section>
      </div>

      {aramaSonuclari.length > 0 && (
        <section className="panel arama-bolumu">
          <div className="panel-baslik">
            <Search size={19} />
            <div>
              <h2>Arama Sonuçları</h2>
              <p>Eklemek istediğin filmin üzerindeki butona bas.</p>
            </div>
          </div>

          <div className="film-grid">
            {aramaSonuclari.map(film => (
              <div className="film-karti" key={film.imdbID}>
                <div className="poster-kapsayici">
                  {film.Poster && film.Poster !== 'N/A'
                    ? <img src={film.Poster} alt={film.Title} />
                    : <div className="poster-yok">Afiş bulunamadı</div>}
                </div>
                <div className="kart-icerik">
                  <h3>{film.Title}</h3>
                  <p><CalendarDays size={13} /> {film.Year}</p>
                  <button
                    type="button"
                    className="ekle-buton"
                    onClick={() => arananFilmiEkle(film)}
                  >
                    <Plus size={15} /> Listeye Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="panel arsiv-paneli">
        <div className="arsiv-baslik">
          <div className="panel-baslik">
            <Film size={21} />
            <div>
              <h2>Film Listem <span className="baslik-sayac">{filtrelenmisFilmler.length}</span></h2>
              <p>Tüm filmlerin burada, istediğin zaman bul.</p>
            </div>
          </div>

          <div className="liste-arama">
            <Search size={17} />
            <input
              type="search"
              placeholder="Arşivimde film ara..."
              value={listeArama}
              onChange={e => setListeArama(e.target.value)}
            />
            {listeArama && (
              <button type="button" onClick={() => setListeArama('')} aria-label="Temizle">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        <div className="durum-filtreleri">
          <ListFilter size={17} className="filtre-ikon" />
          {filtreler.map(({ ad, sayi, Icon }) => (
            <button
              key={ad}
              type="button"
              className={`filtre-butonu ${durumFiltresi === ad ? 'aktif' : ''}`}
              onClick={() => setDurumFiltresi(ad)}
            >
              <Icon size={15} />
              {ad}
              <span>{sayi}</span>
            </button>
          ))}
        </div>

        {filtrelenmisFilmler.length === 0 ? (
          <div className="bos-liste">
            <Film size={30} />
            <p>{filmler.length === 0
              ? 'Henüz film eklenmedi. İlk filmini ekleyerek başla!'
              : 'Bu arama veya filtre için film bulunamadı.'}</p>
          </div>
        ) : (
          <div className="film-grid">
            {filtrelenmisFilmler.map(film => (
              <div className="film-karti" key={film.id}>
                <div className="poster-kapsayici">
                  {film.Poster && film.Poster !== 'N/A'
                    ? <img src={film.Poster} alt={film.Title} />
                    : <div className="poster-yok">Afiş yok</div>}
                  <span className={`durum-etiketi ${
                    film.durum === 'İzledim' ? 'etiket-izlendi'
                      : film.durum === 'İzleme listemde' ? 'etiket-liste'
                        : 'etiket-izlenmedi'
                  }`}>
                    {film.durum === 'İzledim' ? <CheckCircle2 size={12} />
                      : film.durum === 'İzleme listemde' ? <Bookmark size={12} />
                        : <CirclePlay size={12} />}
                    {film.durum || 'İzlemedim'}
                  </span>
                </div>

                <div className="kart-icerik">
                  <h3>{film.Title}</h3>
                  <p><CalendarDays size={13} /> {film.Year || 'Yıl belirtilmedi'}</p>

                  <select
                    className={`durum-secimi ${
                      film.durum === 'İzledim' ? 'durum-izlendi'
                        : film.durum === 'İzleme listemde' ? 'durum-liste'
                          : 'durum-izlenmedi'
                    }`}
                    value={film.durum || 'İzlemedim'}
                    onChange={e => filmDurumuDegistir(film.id, e.target.value)}
                    aria-label={`${film.Title} izlenme durumu`}
                  >
                    {DURUMLAR.map(durum =>
                      <option key={durum} value={durum}>{durum}</option>
                    )}
                  </select>

                  <label className="poster-yukle">
                    <Upload size={13} /> Afiş Değiştir
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={e => {
                        posterDegistir(film.id, e.target.files[0])
                        e.target.value = ''
                      }}
                    />
                  </label>

                  <div className="kart-butonlar">
                    <button type="button" onClick={() => filmDuzenle(film.id)}>
                      <Pencil size={14} /> Düzenle
                    </button>
                    <button type="button" className="sil-buton" onClick={() => filmSil(film.id)}>
                      <Trash2 size={14} /> Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">
        <span><Clapperboard size={15} /> FilmBox</span>
        <span>Kişisel film arşivin • IndexedDB ile yerel kayıt</span>
      </footer>
    </div>
  )
}

export default App
