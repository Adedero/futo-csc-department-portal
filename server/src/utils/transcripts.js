function arrangeTranscriptData(results) {
  results.forEach((session, index) => {
    let TNU = 0;
    let TGP = 0;
    session.forEach((semesterResult) => {
      TNU += semesterResult.totalUnits;
      TGP += semesterResult.totalGradePoints;
    });
    results[index] = {
      TNU: TNU,
      TGP: TGP,
      level: session[0].level,
      results: session,
    };
  });

  results.sort((a, b) => a.level - b.level);

  let prevTNU = 0;
  let prevTGP = 0;
  results.forEach((session) => {
    session.prevTNU = prevTNU;
    session.prevTGP = prevTGP;
    prevTNU += session.TNU;
    prevTGP += session.TGP;
  });

  return results;
}

function getGradePoints(grade, unit) {
  if (grade.toUpperCase() === "A") {
    return unit * 5;
  }
  if (grade.toUpperCase() === "B") {
    return unit * 4;
  }
  if (grade.toUpperCase() === "C") {
    return unit * 3;
  }
  if (grade.toUpperCase() === "D") {
    return unit * 2;
  }
  if (grade.toUpperCase() === "E") {
    return unit * 1;
  }
  if (grade.toUpperCase() === "F") {
    return 0;
  }

  return 0;
}

module.exports = { arrangeTranscriptData, getGradePoints };
