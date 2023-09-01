export default defineEventHandler((event) => {
  const query = getQuery(event)
  const from = query.from || 'Digital Innova'

  return `Hello ${from}!`
})
