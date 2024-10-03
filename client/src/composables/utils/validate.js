export function validateSessionName(sessionName) {
  const sessionNameArray = sessionName.split('-')
  if (sessionNameArray.length !== 2) return false
  const start = parseInt(sessionNameArray[0])
  const end = parseInt(sessionNameArray[sessionNameArray.length - 1])

  if (end > start && end - start === 1) return true
  return false
}
