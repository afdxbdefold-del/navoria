// Google Places primaryType / types  ->  benutzerfreundliches deutsches Label + Fachrichtung
// Bleibt neutral, wenn Typ unklar ist.

const PRIMARY_TYPE_MAP = {
  doctor: { label: 'Arztpraxis', specialty: null },
  general_practitioner: { label: 'Hausarzt / Allgemeinmedizin', specialty: 'Hausarzt' },
  dentist: { label: 'Zahnarztpraxis', specialty: 'Zahnarzt' },
  dental_clinic: { label: 'Zahnklinik', specialty: 'Zahnarzt' },
  pharmacy: { label: 'Apotheke', specialty: 'Apotheke' },
  hospital: { label: 'Krankenhaus', specialty: 'Krankenhaus' },
  general_hospital: { label: 'Krankenhaus', specialty: 'Krankenhaus' },
  physiotherapist: { label: 'Physiotherapie', specialty: 'Physiotherapeut' },
  pediatrician: { label: 'Kinderarzt', specialty: 'Kinderarzt' },
  dermatologist: { label: 'Hautarztpraxis', specialty: 'Hautarzt' },
  gynecologist: { label: 'Frauenarztpraxis', specialty: 'Frauenarzt' },
  ophthalmologist: { label: 'Augenarztpraxis', specialty: 'Augenarzt' },
  cardiologist: { label: 'Kardiologische Praxis', specialty: 'Kardiologe' },
  orthopedic_surgeon: { label: 'Orthopädische Praxis', specialty: 'Orthopäde' },
  neurologist: { label: 'Neurologische Praxis', specialty: 'Neurologe' },
  psychiatrist: { label: 'Psychiatrische Praxis', specialty: 'Psychiater' },
  psychologist: { label: 'Psychologische Praxis', specialty: 'Psychotherapeut' },
  urologist: { label: 'Urologische Praxis', specialty: 'Urologe' },
  radiologist: { label: 'Radiologische Praxis', specialty: 'Radiologe' },
  chiropractor: { label: 'Chiropraktische Praxis', specialty: null },
  medical_clinic: { label: 'Ärztezentrum / MVZ', specialty: null },
  health: { label: 'Gesundheitseinrichtung', specialty: null },
  physical_therapist: { label: 'Physiotherapie', specialty: 'Physiotherapeut' },
};

export function humanizePrimaryType(primaryType, specialtyGuess) {
  if (primaryType && PRIMARY_TYPE_MAP[primaryType]) {
    return PRIMARY_TYPE_MAP[primaryType].label;
  }
  if (specialtyGuess) return `${specialtyGuess}praxis`.replace('praxispraxis', 'praxis');
  return 'Arztpraxis';
}

export function specialtyFromTypes(primaryType, types = []) {
  if (primaryType && PRIMARY_TYPE_MAP[primaryType]?.specialty) return PRIMARY_TYPE_MAP[primaryType].specialty;
  for (const t of types || []) {
    if (PRIMARY_TYPE_MAP[t]?.specialty) return PRIMARY_TYPE_MAP[t].specialty;
  }
  return null;
}
