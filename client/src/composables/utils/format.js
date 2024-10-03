export function useDate(date) {
  let updatedAt = new Date(date)
  return `${updatedAt.getDate()}/${updatedAt.getMonth() + 1}/${updatedAt.getFullYear()}`
}

export const useLocaleDate = (
  value,
  options = {
    separator: '/',
    format: 'dd-mm-yyyy',
    useAbbreviations: true
  }
) => {
  const date = new Date(value)
  if (!date) return value

  const selectedFormat = options.format || 'dd-mm-yyyy'
  let day, month, year
  /* const days = options.useAbbreviations ?
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] */

  const months = options.useAbbreviations
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : [
        'January',
        'Febuary',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]

  const [, m, y] = selectedFormat.split('-')

  day = date.getDate()

  if (m === 'mm') month = date.getMonth() + 1
  else if (m === 'MM') month = months[date.getMonth()]
  else month = date.getMonth()

  if (y === 'yy') year = date.getFullYear().slice(1)
  else if (y === 'yyyy') year = date.getFullYear()
  else year = date.getFullYear()

  const localeDate = day + options.separator + month + options.separator + year
  return localeDate
}

export function formatGPA(gpa) {
  return +(Math.round(gpa + 'e+2') + 'e-2')
}

export function roundGPA(gpa) {
  return Math.round((gpa + Number.EPSILON) * 100) / 100
}

export function getHonours(gpa) {
  if (gpa >= 4.5 && gpa <= 5.0) {
    return 'FIRST CLASS HONOURS'
  }

  if (gpa >= 3.5 && gpa <= 4.49) {
    return 'SECOND CLASS HONOURS (UPPER DIVISION)'
  }

  if (gpa >= 2.4 && gpa <= 3.49) {
    return 'SECOND CLASS HONOURS (LOWER DIVISION)'
  }

  if (gpa >= 1.5 && gpa <= 2.39) {
    return 'THIRD CLASS HONOURS'
  }

  if (gpa >= 1 && gpa <= 1.49) {
    return 'PASS'
  }

  return 'FAIL'
}

export function getNumberOfCourses(courses) {
  let rain = 0
  let har = 0
  for (let course of courses) {
    let code = course.code
    let courseEnding = parseInt(code[code.length - 1])

    if (courseEnding % 2 === 0 || courseEnding === 0) {
      rain += 1
    } else if (courseEnding % 2 !== 0) {
      har += 1
    }
  }

  return { rain, har }
}
