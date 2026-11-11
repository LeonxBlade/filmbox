
import { openDB } from 'idb'

const dbPromise = openDB('filmbox-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('filmler')) {
      db.createObjectStore('filmler', {
        keyPath: 'id'
      })
    }
  }
})

export async function tumFilmleriGetir() {
  const db = await dbPromise
  return db.getAll('filmler')
}

export async function filmKaydet(film) {
  const db = await dbPromise
  return db.put('filmler', film)
}

export async function filmSil(id) {
  const db = await dbPromise
  return db.delete('filmler', id)
}

export async function tumFilmleriSil() {
  const db = await dbPromise
  return db.clear('filmler')
}

export async function tumFilmleriKaydet(filmler) {
  const db = await dbPromise
  const tx = db.transaction('filmler', 'readwrite')

  await tx.store.clear()

  for (const film of filmler) {
    const kayit = {
      ...film,
      // Geçici tarayıcı adresini kaydetme.
      // Yerel afişin Blob verisini sakla.
      Poster: film.posterBlob ? null : film.Poster
    }

    await tx.store.put(kayit)
  }

  await tx.done
}
