
export default async function handler(request) {
  const url = new URL(request.url)
  const filmAdi = url.searchParams.get('s')

  if (!filmAdi || !filmAdi.trim()) {
    return Response.json(
      { error: 'Film adı gerekli.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.OMDB_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: 'OMDb API anahtarı ayarlanmamış.' },
      { status: 500 }
    )
  }

  try {
    const apiUrl = new URL('https://www.omdbapi.com/')
    apiUrl.searchParams.set('apikey', apiKey)
    apiUrl.searchParams.set('s', filmAdi.trim())
    apiUrl.searchParams.set('type', 'movie')

    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error('OMDb servisine bağlanılamadı.')
    }

    const data = await response.json()

    return Response.json(data)
  } catch {
    return Response.json(
      { error: 'Film araması sırasında hata oluştu.' },
      { status: 500 }
    )
  }
}
