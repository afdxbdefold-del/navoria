// Baut individuelle FAQs pro Praxis auf – ausschließlich datenbasiert.
// Fragen ohne belastbare Antwort werden nicht ausgegeben.

export function buildFaqs(d, { humanizedType, hasHours } = {}) {
  const items = [];
  const displayName = d.name || 'Diese Praxis';
  const city = d.city || null;
  const specialty = d.specialty_guess || null;

  // 1. Standort
  if (d.formatted_address) {
    items.push({
      q: `Wo befindet sich ${displayName}?`,
      a: `Die Praxis befindet sich in ${d.formatted_address}${city ? '' : ''}. Eine Anfahrtsplanung ist direkt über den Routen-Link auf dieser Seite möglich.`,
    });
  }

  // 2. Telefon
  const phone = d.phone_national || d.phone_international;
  items.push({
    q: `Wie lautet die Telefonnummer von ${displayName}?`,
    a: phone
      ? `Die auf dieser Seite hinterlegte Telefonnummer lautet ${phone}. Bitte prüfen Sie die Erreichbarkeit direkt bei der Praxis, da Sprechzeiten abweichen können.`
      : 'Eine Telefonnummer liegt uns aktuell nicht zuverlässig vor. Bitte nutzen Sie die Website, sofern verfügbar.',
  });

  // 3. Fachrichtung
  items.push({
    q: `Welche Fachrichtung hat ${displayName}?`,
    a: specialty
      ? `${displayName} ist als ${specialty}${humanizedType && humanizedType !== 'Arztpraxis' ? ` (${humanizedType})` : ''} in ${city || 'der Region'} eingetragen. Behandlungsschwerpunkte können abweichen und sollten direkt bei der Praxis erfragt werden.`
      : 'Das Fachgebiet dieser Praxis liegt uns aktuell nicht eindeutig vor. Bitte bestätigen Sie den Behandlungsschwerpunkt direkt bei der Praxis.',
  });

  // 4. Öffnungszeiten
  items.push({
    q: `Wie sind die Öffnungszeiten von ${displayName}?`,
    a: hasHours
      ? 'Die regulären Öffnungszeiten sind auf dieser Seite im Abschnitt „Öffnungszeiten“ zu finden. Abweichungen an Feiertagen oder durch Praxisurlaub sind möglich. Wir empfehlen, die Zeiten vor einem Besuch telefonisch zu bestätigen.'
      : 'Öffnungszeiten liegen uns aktuell nicht zuverlässig vor. Bitte bestätigen Sie die Zeiten direkt bei der Praxis.',
  });

  // 5. Termin
  items.push({
    q: `Wie kann ich einen Termin bei ${displayName} vereinbaren?`,
    a: [
      phone ? `Am schnellsten telefonisch unter ${phone}.` : 'Aktuell liegt uns keine Telefonnummer vor.',
      d.website_url ? `Über die Praxiswebsite können ggf. weitere Kontaktwege oder Online-Terminfunktionen genutzt werden.` : null,
      'Ein automatischer Buchungslink ist auf Navoria nicht hinterlegt.',
    ].filter(Boolean).join(' '),
  });

  // 6. Website
  items.push({
    q: `Gibt es eine Website von ${displayName}?`,
    a: d.website_url
      ? `Ja, die auf dieser Seite hinterlegte Website ist ${d.website_url}.`
      : 'Eine offizielle Website ist uns aktuell nicht bekannt. Bitte fragen Sie bei einem telefonischen Kontakt direkt in der Praxis nach.',
  });

  // 7. Anfahrt
  if (d.formatted_address) {
    items.push({
      q: `Wie komme ich zur Praxis ${displayName}?`,
      a: `Die Praxis liegt an folgender Adresse: ${d.formatted_address}. Über den Button „Route planen“ oben auf dieser Seite können Sie die Anfahrt starten. Informationen zu Parkmöglichkeiten oder Barrierefreiheit finden Sie – sofern verfügbar – im Abschnitt „Praxis-Details“.`,
    });
  }

  // 8. Verbindlichkeit (Pflicht)
  items.push({
    q: 'Sind die Angaben auf Navoria verbindlich?',
    a: 'Nein. Navoria stellt öffentlich verfügbare Praxisinformationen bereit. Angaben zu Öffnungszeiten, Leistungen und Terminverfügbarkeit können sich ändern. Bitte bestätigen Sie wichtige Informationen direkt bei der Praxis.',
  });

  return items.slice(0, 8);
}
