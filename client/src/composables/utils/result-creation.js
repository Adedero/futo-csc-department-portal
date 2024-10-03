export function studentTotal(student, course) {
  let total = 0
  let testScore = parseFloat(student.testScore) || 0
  let labScore = parseFloat(student.labScore) || 0
  let examScore = parseFloat(student.examScore) || 0

  if (course.hasPractical) {
    total = testScore + labScore + examScore
    student.total = total
    return total
  } else {
    total = testScore + examScore
    student.total = total
    return total
  }
}

export function studentGrade(student, course) {
  let total = studentTotal(student, course)
  if (total < 40 || (course.hasPractical && !student.labScore)) {
    student.grade = 'F'
    return 'F'
  }
  if (total >= 40 && total <= 44) {
    student.grade = 'E'
    return 'E'
  }
  if (total >= 45 && total <= 49) {
    student.grade = 'D'
    return 'D'
  }
  if (total >= 50 && total <= 59) {
    student.grade = 'C'
    return 'C'
  }
  if (total >= 60 && total <= 69) {
    student.grade = 'B'
    return 'B'
  }
  if (total >= 70) {
    student.grade = 'A'
    return 'A'
  }

  return ''
}

export function studentRemark(student, course) {
  let grade = studentGrade(student, course)
  if (grade == 'F') {
    student.remark = 'FAIL'
    return 'FAIL'
  }

  if (grade == 'E' || grade == 'D' || grade == 'C' || grade == 'B' || grade == 'A') {
    student.remark = 'PASS'
    return 'PASS'
  }

  return ''
}

export function saveProgress(student, course, toast = null) {
  const localStorageKey = `result_${course._id}`
  const storedData = JSON.parse(localStorage.getItem(localStorageKey)) || {
    course: course.code,
    students: []
  }

  // Check if the student already exists in the stored data
  const existingStudentIndex = storedData.students.findIndex(
    (item) => item.studentId === student._id
  )

  if (existingStudentIndex !== -1) {
    // If the student exists, update the existing record
    storedData.students[existingStudentIndex].testScore = student.testScore
    storedData.students[existingStudentIndex].labScore = student.labScore
    storedData.students[existingStudentIndex].examScore = student.examScore
  } else {
    // If the student doesn't exist, add a new record
    const newRecord = {
      studentId: student._id,
      testScore: student.testScore,
      labScore: student.labScore,
      examScore: student.examScore
    }

    storedData.students.push(newRecord)
  }

  localStorage.setItem(localStorageKey, JSON.stringify(storedData))

  if (toast) {
    toast.success('Saved', {
      position: 'top-right',
      duration: 2000
    })
  }
}

export function displaySavedResults(records, course) {
  // Retrieve and display saved results from local storage when the page loads
  const localStorageKey = `result_${course._id}`
  const storedData = JSON.parse(localStorage.getItem(localStorageKey))

  if (storedData) {
    // Iterate through the stored student records
    storedData.students.forEach((storedStudent) => {
      const matchingStudent = records.find((student) => student._id === storedStudent.studentId)

      if (matchingStudent) {
        // Update the student record with the saved data
        Object.assign(matchingStudent, storedStudent)
      }
    })
  }
}
