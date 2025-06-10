export const formatDoctorName = (firstName) => {
  const trimmed = firstName.trim();
  return trimmed.toLowerCase().startsWith('dr.') ? trimmed : `Dr. ${trimmed}`;
};