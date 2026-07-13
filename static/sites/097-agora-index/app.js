const cities = {
  lakeview: { score: 74, housing: '31%', housingTrend: '↑ 2.8%', budget: '$42m', transit: '87%', transitTrend: '↑ 3.4%', voice: '6.2k', meters: [68, 81, 87, 62] },
  riverbend: { score: 68, housing: '34%', housingTrend: '↑ 1.9%', budget: '$31m', transit: '79%', transitTrend: '↑ 1.6%', voice: '4.8k', meters: [74, 76, 79, 58] },
  oakridge: { score: 81, housing: '27%', housingTrend: '↓ 0.6%', budget: '$54m', transit: '92%', transitTrend: '↑ 4.1%', voice: '7.1k', meters: [55, 89, 92, 71] }
};

const citySelect = document.querySelector('#city');
const meterIds = ['housingMeter', 'budgetMeter', 'transitMeter', 'voiceMeter'];

document.querySelector('#signalJump').addEventListener('click', () => {
  document.querySelector('#signals').scrollIntoView();
});

citySelect.addEventListener('change', (event) => {
  const data = cities[event.target.value];
  document.querySelector('#score').textContent = data.score;
  document.querySelector('#housingValue').textContent = data.housing;
  document.querySelector('#housingTrend').textContent = data.housingTrend;
  document.querySelector('#budgetValue').textContent = data.budget;
  document.querySelector('#transitValue').textContent = data.transit;
  document.querySelector('#transitTrend').textContent = data.transitTrend;
  document.querySelector('#tickerTransit').textContent = data.transitTrend;
  document.querySelector('#voiceValue').textContent = data.voice;
  meterIds.forEach((id, index) => {
    document.getElementById(id).style.width = `${data.meters[index]}%`;
  });
});

document.querySelector('#download').addEventListener('click', () => {
  const place = document.querySelector('#city option:checked').textContent;
  const data = cities[citySelect.value];
  const csv = `city,signal,value,unit,updated\n${place},housing,${data.housing},income spent on median rent,2026-07-13\n${place},budget,${data.budget},public works allocation,2026-07-13\n${place},transit,${data.transit},on-time arrivals,2026-07-13\n${place},participation,${data.voice},public responses,2026-07-13`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  link.download = `agora-index-${citySelect.value}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
  const toast = document.querySelector('#toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
});
