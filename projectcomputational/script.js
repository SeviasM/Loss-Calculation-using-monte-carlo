let histogramChart, cdfChart, lineChart, cumulativeChart;

function formatCurrency(value) {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M';
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'K';
  return '$' + value.toFixed(0);
}

function runSimulation() {
  const btn = document.getElementById('runBtn');
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');

  // Show loading
  btn.disabled = true;
  loading.classList.add('show');
  results.classList.remove('show');

  fetch('/run-simulation')
    .then(response => response.json())
    .then(data => {
      // Hide loading, show results
      loading.classList.remove('show');
      results.classList.add('show');
      btn.disabled = false;

      // Update stats
      document.getElementById('meanLoss').textContent = formatCurrency(data.mean_loss);
      document.getElementById('medianLoss').textContent = formatCurrency(data.median_loss);
      document.getElementById('var95').textContent = formatCurrency(data.var_95);
      document.getElementById('var99').textContent = formatCurrency(data.var_99);
      document.getElementById('stdLoss').textContent = formatCurrency(data.std_loss);
      document.getElementById('numSims').textContent = data.num_simulations.toLocaleString();

      // Draw all charts
      drawHistogram(data.losses);
      drawCDF(data.losses);
      drawLineChart(data.losses);
      drawCumulativeChart(data.losses);
    })
    .catch(error => {
      loading.classList.remove('show');
      btn.disabled = false;
      console.error('Error:', error);
    });
}

function getChartOptions(xTitle, yTitle) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: xTitle, color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#94a3b8' },
        title: { display: true, text: yTitle, color: '#94a3b8' }
      }
    }
  };
}

function drawHistogram(losses) {
  const ctx = document.getElementById('histogramChart').getContext('2d');
  if (histogramChart) histogramChart.destroy();

  // Create histogram bins
  const numBins = 25;
  const sorted = [...losses].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const binWidth = (max - min) / numBins || 1;

  const bins = new Array(numBins).fill(0);
  const labels = [];

  for (let i = 0; i < numBins; i++) {
    labels.push(formatCurrency(min + i * binWidth));
  }

  losses.forEach(val => {
    const binIndex = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
    bins[binIndex]++;
  });

  histogramChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: bins,
        backgroundColor: 'rgba(6, 182, 212, 0.7)',
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: getChartOptions('Portfolio Loss', 'Frequency')
  });
}

function drawCDF(losses) {
  const ctx = document.getElementById('cdfChart').getContext('2d');
  if (cdfChart) cdfChart.destroy();

  const sorted = [...losses].sort((a, b) => a - b);
  const n = sorted.length;
  const step = Math.max(1, Math.floor(n / 100));

  const labels = [];
  const data = [];

  for (let i = 0; i < n; i += step) {
    labels.push(formatCurrency(sorted[i]));
    data.push(((i + 1) / n * 100).toFixed(1));
  }

  cdfChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }]
    },
    options: getChartOptions('Portfolio Loss', 'Cumulative Probability (%)')
  });
}

function drawLineChart(losses) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  if (lineChart) lineChart.destroy();

  const step = Math.max(1, Math.floor(losses.length / 200));
  const labels = [];
  const data = [];

  for (let i = 0; i < losses.length; i += step) {
    labels.push(i + 1);
    data.push(losses[i]);
  }

  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 0
      }]
    },
    options: {
      ...getChartOptions('Simulation #', 'Portfolio Loss'),
      scales: {
        ...getChartOptions('', '').scales,
        y: {
          ...getChartOptions('', '').scales.y,
          ticks: {
            color: '#94a3b8',
            callback: value => formatCurrency(value)
          }
        }
      }
    }
  });
}

function drawCumulativeChart(losses) {
  const ctx = document.getElementById('cumulativeChart').getContext('2d');
  if (cumulativeChart) cumulativeChart.destroy();

  const cumulative = [];
  let sum = 0;
  losses.forEach(val => {
    sum += val;
    cumulative.push(sum);
  });

  const step = Math.max(1, Math.floor(losses.length / 200));
  const labels = [];
  const data = [];

  for (let i = 0; i < cumulative.length; i += step) {
    labels.push(i + 1);
    data.push(cumulative[i]);
  }

  cumulativeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.1,
        pointRadius: 0
      }]
    },
    options: {
      ...getChartOptions('Simulation #', 'Cumulative Loss'),
      scales: {
        ...getChartOptions('', '').scales,
        y: {
          ...getChartOptions('', '').scales.y,
          ticks: {
            color: '#94a3b8',
            callback: value => formatCurrency(value)
          }
        }
      }
    }
  });
}