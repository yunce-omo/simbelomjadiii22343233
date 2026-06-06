/* ════════════════════════════════════════════
   LAUNDRYPRO — chart.js
   Semua konfigurasi & inisialisasi Chart.js
   Membutuhkan: https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
   ════════════════════════════════════════════ */

/* ────────────────────────────────────────────
   INSTANCE REGISTRY
   Simpan instance chart agar bisa destroy sebelum re-render
   ──────────────────────────────────────────── */
let charts = {};


/* ────────────────────────────────────────────
   GRADIENT HELPERS
   ──────────────────────────────────────────── */
function gradientBlue(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, 'rgba(94,114,228,0.4)');
  g.addColorStop(1, 'rgba(94,114,228,0)');
  return g;
}

function gradientGreen(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, 'rgba(45,206,137,0.35)');
  g.addColorStop(1, 'rgba(45,206,137,0)');
  return g;
}


/* ────────────────────────────────────────────
   DATA DUMMY
   ──────────────────────────────────────────── */
const dataMingguan = {
  labels: ['Sen','Sel','Rab','Kam','Jum','Sab','Min'],
  data:   [8, 12, 10, 15, 18, 14, 9]
};

const dataBulanan = {
  labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
  data:   [420000,380000,510000,490000,600000,750000,680000,720000,800000,760000,820000,900000]
};

const dataMingguanSales = {
  labels: ['Sen','Sel','Rab','Kam','Jum','Sab','Min'],
  data:   [180000,220000,195000,280000,310000,260000,150000]
};


/* ────────────────────────────────────────────
   CREATE CHART HELPER
   Destroy dulu jika sudah ada, lalu buat baru
   ──────────────────────────────────────────── */
function createChart(id, config) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(canvas, config);
}


/* ────────────────────────────────────────────
   OPSI AXIS DEFAULT (reusable)
   ──────────────────────────────────────────── */
const axisDefault = {
  y: {
    grid: { color: '#f0f2f5' },
    ticks: { color: '#8898aa', font: { size: 11 } }
  },
  x: {
    grid: { display: false },
    ticks: { color: '#8898aa', font: { size: 11 } }
  }
};

const axisRupiah = {
  y: {
    grid: { color: '#f0f2f5' },
    ticks: {
      color: '#8898aa', font: { size: 11 },
      callback: v => 'Rp ' + Number(v).toLocaleString('id-ID')
    }
  },
  x: {
    grid: { display: false },
    ticks: { color: '#8898aa', font: { size: 11 } }
  }
};


/* ════════════════════════════════════════════
   INIT ALL CHARTS
   Dipanggil saat navigasi & DOMContentLoaded
   ════════════════════════════════════════════ */
function initCharts() {

  /* ── 1. Chart Pesanan Minggu Ini (Karyawan Dashboard) — LINE ── */
  createChart('chartWeekK', {
    type: 'line',
    data: {
      labels: dataMingguan.labels,
      datasets: [{
        label: 'Pesanan',
        data: dataMingguan.data,
        borderColor: '#5e72e4',
        backgroundColor: ctx => gradientBlue(ctx.chart.ctx),
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#5e72e4',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: axisDefault
    }
  });


  /* ── 2. Chart Pendapatan Overview (Admin Dashboard) — BAR ── */
  const isMinggu = document.getElementById('btnMinggu')?.classList.contains('active');
  const dSales   = isMinggu ? dataMingguanSales : dataBulanan;

  createChart('chartPenjualan', {
    type: 'bar',
    data: {
      labels: dSales.labels,
      datasets: [
        {
          label: 'Pendapatan',
          data: dSales.data,
          backgroundColor: 'rgba(94,114,228,0.75)',
          borderRadius: 6,
          borderSkipped: false
        },
        {
          label: 'Target',
          data: dSales.data.map(v => v * 1.2),
          backgroundColor: 'rgba(45,206,137,0.3)',
          borderRadius: 6,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, color: '#8898aa' }
        }
      },
      scales: axisRupiah
    }
  });


  /* ── 3. Chart Distribusi Pelanggan (donut) ── */
  createChart('chartPelanggan', {
    type: 'doughnut',
    data: {
      labels: ['Perempuan','Laki-laki'],
      datasets: [{
        data: [148, 100],
        backgroundColor: ['#fb6340','#11cdef'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: { legend: { display: false } }
    }
  });


  /* ── 4. Chart Total Pesanan per Hari (Admin Dashboard) — BAR ── */
  createChart('chartTotalOrders', {
    type: 'bar',
    data: {
      labels: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'],
      datasets: [{
        label: 'Pesanan',
        data: [12,18,14,22,16,8,20,25,18,30,22,28,16,24,19,27,21,15,26,23],
        backgroundColor: 'rgba(251,99,64,0.75)',
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: axisDefault
    }
  });


  /* ── 5. Chart Pendapatan (Data Penjualan) — LINE ── */
  const isMinggu2 = document.getElementById('btnMinggu2')?.classList.contains('active');
  const dSales2   = isMinggu2 ? dataMingguanSales : dataBulanan;

  createChart('chartPenjualan2', {
    type: 'line',
    data: {
      labels: dSales2.labels,
      datasets: [{
        label: 'Pendapatan',
        data: dSales2.data,
        borderColor: '#5e72e4',
        backgroundColor: ctx => gradientBlue(ctx.chart.ctx),
        borderWidth: 2.5,
        pointRadius: 4,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#5e72e4'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: axisRupiah
    }
  });


  /* ── 6. Chart Paket Terlaris (donut) ── */
  createChart('chartPaket', {
    type: 'doughnut',
    data: {
      labels: ['Reguler','Express','Kilat','Cuci Setrika','Setrika Saja'],
      datasets: [{
        data: [45, 25, 15, 10, 5],
        backgroundColor: ['#5e72e4','#2dce89','#11cdef','#fb6340','#ffd600'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 }, color: '#8898aa' }
        }
      }
    }
  });


  /* ── 7. Chart Pertumbuhan Pelanggan — LINE ── */
  createChart('chartGrowth', {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','Mei','Jun'],
      datasets: [{
        label: 'Total Pelanggan',
        data: [180, 195, 210, 225, 238, 248],
        borderColor: '#5e72e4',
        backgroundColor: ctx => gradientBlue(ctx.chart.ctx),
        borderWidth: 2.5,
        pointRadius: 4,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#5e72e4'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: axisDefault
    }
  });


  /* ── 8. Chart Segmentasi Gender — BAR ── */
  createChart('chartGender', {
    type: 'bar',
    data: {
      labels: ['Perempuan','Laki-laki'],
      datasets: [{
        data: [148, 100],
        backgroundColor: ['rgba(251,99,64,0.75)','rgba(17,205,239,0.75)'],
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: axisDefault
    }
  });

}


/* ════════════════════════════════════════════
   TOGGLE PERIODE CHART (Minggu / Bulan)
   ════════════════════════════════════════════ */
function switchPeriod(p) {
  document.getElementById('btnMinggu').classList.toggle('active', p === 'minggu');
  document.getElementById('btnBulan').classList.toggle('active',  p === 'bulan');
  setTimeout(initCharts, 50);
}

function switchPeriod2(p) {
  document.getElementById('btnMinggu2').classList.toggle('active', p === 'minggu');
  document.getElementById('btnBulan2').classList.toggle('active',  p === 'bulan');
  setTimeout(initCharts, 50);
}
