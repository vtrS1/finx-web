export function calculateAge(birthDate: string, referenceDate = new Date()): number {
  const date = new Date(birthDate);
  let age = referenceDate.getFullYear() - date.getFullYear();
  const monthDifference = referenceDate.getMonth() - date.getMonth();
  const hasBirthdayPassed =
    monthDifference > 0 || (monthDifference === 0 && referenceDate.getDate() >= date.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}
