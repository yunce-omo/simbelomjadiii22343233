/* ════════════════════════════════════════════
   LAUNDRYPRO — website.js
   Semua logika aplikasi (state, navigasi, form, render tabel)
   Chart dipisah ke chart.js
   ════════════════════════════════════════════ */

/* ────────────────────────────────────────────
   STATE APLIKASI
   ──────────────────────────────────────────── */
let pesananCounter = 6;
let trxCounter = 4;
let currentRole = "karyawan";
let currentPage = "pg-dashboard-k";
let filterJadwalAktif = "semua";

/* ────────────────────────────────────────────
   FORMAT RUPIAH
   ──────────────────────────────────────────── */
function rupiah(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

/* ────────────────────────────────────────────
   NAVIGASI — tampilkan/sembunyikan halaman
   ──────────────────────────────────────────── */
function navigateTo(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");

  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((item) => {
    if (
      item.getAttribute("onclick") &&
      item.getAttribute("onclick").includes(pageId)
    ) {
      item.classList.add("active");
    }
  });

  currentPage = pageId;

  const titles = {
    "pg-dashboard-k": ["Dashboard Karyawan", "Selamat datang, Andi!"],
    "pg-input-laundry": ["Input Laundry", "Tambah pesanan baru"],
    "pg-jadwal-laundry": ["Jadwal Laundry", "Daftar semua pesanan"],
    "pg-status-pesanan": ["Status Pesanan", "Update & kelola status"],
    "pg-transaksi-baru": ["Transaksi Baru", "Catat pembayaran masuk"],
    "pg-jadwal-kerja": ["Jadwal Kerja", "Shift karyawan minggu ini"],
    "pg-pembelian": ["Data Pembelian", "Stok & riwayat beli"],
    "pg-dashboard-a": ["Dashboard Admin", "Overview bisnis laundry"],
    "pg-data-penjualan": ["Data Penjualan", "Riwayat pendapatan"],
    "pg-pelanggan": ["Data Pelanggan", "Database pelanggan"],
    "pg-laporan": ["Laporan", "Cetak & ekspor laporan"],
  };
  if (titles[pageId]) {
    document.getElementById("topbarTitle").textContent = titles[pageId][0];
    document.getElementById("topbarSub").textContent = titles[pageId][1];
  }

  updateTrxStats();

  // Re-render chart setelah page tampil
  setTimeout(initCharts, 50);
}

/* ────────────────────────────────────────────
   MODAL HELPERS
   ──────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

/* ────────────────────────────────────────────
   TOAST NOTIFIKASI
   ──────────────────────────────────────────── */
function showToast(msg, type = "success") {
  const tc = document.getElementById("toastContainer");
  const t = document.createElement("div");
  t.className = "toast" + (type === "error" ? " error" : "");
  t.innerHTML = (type === "success" ? "✅" : "❌") + " " + msg;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ────────────────────────────────────────────
   SUBMIT FORM LAUNDRY (halaman utama)
   ──────────────────────────────────────────── */
function submitLaundry() {
  const nama = document.getElementById("inpNama").value.trim();
  const gender = document.getElementById("inpGender").value;
  const wa = document.getElementById("inpWA").value.trim();
  const paket = document.getElementById("inpPaket").value;
  const berat = document.getElementById("inpBerat").value;
  const selesai = document.getElementById("inpTglSelesai").value;

  if (!nama || !wa || !paket) {
    showToast("Mohon isi semua field wajib (*)", "error");
    return;
  }

  const id = "L" + String(pesananCounter++).padStart(3, "0");
  pesananList.push({
    id,
    nama,
    gender,
    paket,
    berat: parseFloat(berat) || 1,
    wa,
    tglMasuk: new Date().toISOString().slice(0, 10),
    tglSelesai: selesai,
    status: "baru",
  });

  renderTabelHariIni();
  renderJadwal("semua");
  renderStatus("semua");
  showToast("Pesanan " + id + " berhasil disimpan!");
  resetFormLaundry();
  document.getElementById("badgeJadwal").textContent = pesananList.filter(
    (p) => p.status === "baru",
  ).length;
}

/* ────────────────────────────────────────────
   SUBMIT MODAL LAUNDRY (form cepat)
   ──────────────────────────────────────────── */
function submitModalLaundry() {
  const nama = document.getElementById("mInpNama").value.trim();
  const gender = document.getElementById("mInpGender").value;
  const wa = document.getElementById("mInpWA").value.trim();
  const paket = document.getElementById("mInpPaket").value;
  const berat = document.getElementById("mInpBerat").value;
  const selesai = document.getElementById("mInpTgl").value;

  if (!nama || !wa) {
    showToast("Isi nama & WA terlebih dahulu", "error");
    return;
  }

  const id = "L" + String(pesananCounter++).padStart(3, "0");
  pesananList.push({
    id,
    nama,
    gender,
    paket,
    berat: parseFloat(berat) || 1,
    wa,
    tglMasuk: new Date().toISOString().slice(0, 10),
    tglSelesai: selesai,
    status: "baru",
  });

  renderTabelHariIni();
  renderJadwal("semua");
  renderStatus("semua");
  showToast("Pesanan " + id + " disimpan!");
  closeModal("modalInputLaundry");
}

/* ────────────────────────────────────────────
   RESET FORM LAUNDRY
   ──────────────────────────────────────────── */
function resetFormLaundry() {
  [
    "inpNama",
    "inpGender",
    "inpWA",
    "inpPaket",
    "inpBerat",
    "inpTglMasuk",
    "inpTglSelesai",
    "inpAntarJemput",
    "inpCatatan",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* ────────────────────────────────────────────
   RENDER TABEL PESANAN HARI INI
   ──────────────────────────────────────────── */
function renderTabelHariIni() {
  const today = new Date().toISOString().slice(0, 10);
  const data = pesananList.filter((p) => p.tglMasuk === today);
  const tbody = document.getElementById("tblPesananHariIni");
  document.getElementById("jumlahPesananHariIni").textContent =
    "Total: " + data.length + " pesanan";

  if (!data.length) {
    tbody.innerHTML =
      '<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">📭</div><p>Belum ada pesanan hari ini</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = data
    .map(
      (p) => `
    <tr>
      <td><b>#${p.id}</b></td>
      <td>${p.nama}</td>
      <td><span class="gender-badge ${p.gender === "P" ? "gender-p" : "gender-l"}">${p.gender === "P" ? "Perempuan" : "Laki-laki"}</span></td>
      <td>${p.paket}</td>
      <td>${p.berat} kg</td>
      <td>${p.wa}</td>
      <td>${p.tglSelesai || "-"}</td>
      <td>${badgeHTML(p.status)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="ubahStatus('${p.id}','selesai')">✅</button>
        <button class="btn btn-danger btn-sm" onclick="hapusPesanan('${p.id}')">🗑</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

/* ────────────────────────────────────────────
   RENDER JADWAL LAUNDRY (dengan filter)
   ──────────────────────────────────────────── */
function filterJadwalFn(mode, btn) {
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  btn.classList.add("active");
  const rows = document.querySelectorAll("#tbljadwal tr");

  rows.forEach((row) => {
    const hari = parseInt(row.dataset.hari);
    let tampil = false;
    if (mode === "semua") tampil = true;
    else if (mode === "hariini") tampil = hari === 0;
    else if (mode === "besok") tampil = hari === 1;
    else if (mode === "2hari") tampil = hari === 2;
    else if (mode === "3hari") tampil = hari === 3;
    row.style.display = tampil ? "" : "none";
  });
}

/* ────────────────────────────────────────────
   RENDER STATUS PESANAN
   ──────────────────────────────────────────── */
function filterStatus(mode, btn) {

  document.querySelectorAll("#pg-status-pesanan .filter-tab").forEach(tab => {
    tab.classList.remove("active");
  });

  btn.classList.add("active");

  const rows = document.querySelectorAll("#tblStatus tr");

  rows.forEach((row) => {

    const status = row.dataset.status;

    let tampil = false;

    if (mode === "semua") {
      tampil = true;
    }
    else if (mode === "selesai") {
      tampil = status === "Selesai";
    }
    else if (mode === "terlambat") {
      tampil = status === "Belum Diambil";
    }

    row.style.display = tampil ? "" : "none";
  });
}

/* ────────────────────────────────────────────
   TRANSAKSI
   ──────────────────────────────────────────── */
function submitTrx() {
  const nama = document.getElementById("tInpNama").value.trim();
  const paket = document.getElementById("tInpPaket").value;
  const total = document.getElementById("tInpTotal").value;
  const metode = document.getElementById("tInpMetode").value;
  const status = document.getElementById("tInpStatus").value;

  if (!nama || !total) {
    showToast("Isi nama & total", "error");
    return;
  }

  const id = "T" + String(trxCounter++).padStart(3, "0");
  const now = new Date();
  const waktu =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");
  trxList.push({
    id,
    nama,
    paket,
    total: Number(total),
    metode,
    status,
    waktu,
  });

  renderTrx();
  updateTrxStats();
  showToast("Transaksi " + id + " dicatat!");
  closeModal("modalTambahTrx");
}

function renderTrx() {
  const tbody = document.getElementById("tblTrx");
  if (!tbody) return;
  const statusBadge = {
    lunas: "badge-selesai",
    sebagian: "badge-proses",
    belum: "badge-lewat",
  };
  const statusLabel = {
    lunas: "Lunas",
    sebagian: "Sebagian",
    belum: "Belum Bayar",
  };
  tbody.innerHTML = trxList
    .map(
      (t) => `
    <tr>
      <td>#${t.id}</td>
      <td>${t.nama}</td>
      <td>${t.paket}</td>
      <td>${rupiah(t.total)}</td>
      <td>${t.metode}</td>
      <td><span class="badge ${statusBadge[t.status] || "badge-baru"}">${statusLabel[t.status] || t.status}</span></td>
      <td>${t.waktu}</td>
    </tr>
  `,
    )
    .join("");
}

function updateTrxStats() {
  const total = trxList.reduce(
    (s, t) => s + (t.status === "lunas" ? t.total : 0),
    0,
  );
  const belum = trxList.filter((t) => t.status === "belum").length;
  const totalTr = document.getElementById("totalTrxHariIni");
  const pemasukan = document.getElementById("pemasukanHariIni");
  const blm = document.getElementById("belumBayar");
  if (totalTr) totalTr.textContent = trxList.length;
  if (pemasukan) pemasukan.textContent = rupiah(total);
  if (blm) blm.textContent = belum;
  const badgeTrx = document.getElementById("badgeTrx");
  if (badgeTrx) {
    badgeTrx.textContent = belum;
  }
}
/* ────────────────────────────────────────────
   PEMBELIAN BARANG
   ──────────────────────────────────────────── */
function submitBeli() {
  const nama = document.getElementById("bInpNama").value.trim();
  const qty = document.getElementById("bInpQty").value.trim();
  const harga = document.getElementById("bInpHarga").value;
  const supplier = document.getElementById("bInpSupplier").value.trim();

  if (!nama || !qty || !harga) {
    showToast("Isi semua field", "error");
    return;
  }

  const tgl = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  beliList.unshift({
    tgl,
    nama,
    qty,
    harga: Number(harga),
    supplier,
    oleh: currentRole === "admin" ? "Admin" : "Andi S.",
  });

  renderBeli();
  showToast("Pembelian " + nama + " dicatat!");
  closeModal("modalTambahBeli");
}

function renderBeli() {
  const tbody = document.getElementById("tblPembelian");
  if (!tbody) return;
  tbody.innerHTML = beliList
    .map(
      (b) => `
    <tr>
      <td>${b.tgl}</td>
      <td>${b.nama}</td>
      <td>${b.qty}</td>
      <td>${rupiah(b.harga)}</td>
      <td>${rupiah(b.harga * parseInt(b.qty) || b.harga)}</td>
      <td>${b.supplier}</td>
      <td>${b.oleh}</td>
    </tr>
  `,
    )
    .join("");
}

function showDetail(id, nama, gender, wa, paket, estimasi, status) {
  document.getElementById("detailBody").innerHTML = `
        <p><b>ID:</b> ${id}</p>
        <p><b>Nama:</b> ${nama}</p>
        <p><b>Gender:</b> ${gender}</p>
        <p><b>No WA:</b> ${wa}</p>
        <p><b>Paket:</b> ${paket == 1 ? "Kilat" : "Santuy"}</p>
        <p><b>Estimasi Selesai:</b> ${estimasi}</p>
        <p><b>Status:</b> ${status}</p>
        <div class="capek-gw"><button class="btn-konfirmasi"
        onclick="window.location.href='/selesai/${id}'">Konfirmasi</button></div>
    `;

  document.getElementById("detailModal").style.display = "flex";
}


/* ────────────────────────────────────────────
   INISIALISASI
   Di versi split, inisialisasi dijalankan oleh
   fungsi initApp() di index.html, SETELAH semua
   partial HTML selesai di-fetch dan diinjeksi.
   Fungsi-fungsi di bawah tetap tersedia global
   agar bisa dipanggil dari initApp() maupun
   dari event handler inline di partial HTML.
   ──────────────────────────────────────────── */

   function searchJadwal() {

    let input = document.getElementById("searchJadwal");
    let filter = input.value.toLowerCase();

    let table = document.getElementById("tbljadwal");
    let tr = table.getElementsByTagName("tr");

    for(let i = 0; i < tr.length; i++) {

        let text = tr[i].textContent.toLowerCase();

        if(text.indexOf(filter) > -1){
            tr[i].style.display = "";
        }else{
            tr[i].style.display = "none";
        }
    }
}

function konfirmasiSelesai(id,nama){

    document.getElementById("confirmText").innerHTML =
        `Anda yakin <b>${nama}</b> sudah selesai?`;

    openModal("modalKonfirmasi");

    document.getElementById("btnYa").onclick = function(){

        window.location.href =
            `/status_selesai/${id}`;

    };
}

function konfirmasiDiambil(id,nama){

    document.getElementById("confirmText").innerHTML =
        `Pesanan <b>${nama}</b> sudah diambil pelanggan?`;

    openModal("modalKonfirmasi");

    document.getElementById("btnYa").onclick = function(){

        window.location.href =
            `/status_diambil/${id}`;

    };
}

document.addEventListener("DOMContentLoaded", function(){
  if (typeof activateTab !== "undefined") {
    navigateTo(activateTab);
  }
});

function searchStatus() {

    let input = document.getElementById("searchStatus");
    let filter = input.value.toLowerCase();

    let table = document.getElementById("tblStatus");
    let tr = table.getElementsByTagName("tr");

    for(let i = 0; i < tr.length; i++) {

        let text = tr[i].textContent.toLowerCase();

        if(text.indexOf(filter) > -1){
            tr[i].style.display = "";
        }else{
            tr[i].style.display = "none";
        }
    }
}

///Gawi gawi gawi
function closeDetailJadwal() {

    document.getElementById(
        "detailModalJadwal"
    ).style.display = "none";
}

function showDetailJadwal(
    id,
    nama,
    gender,
    wa,
    paket,
    estimasi,
    status
) {

    document.getElementById("detailBodyJadwal").innerHTML = `
        <p><b>ID:</b> ${id}</p>
        <p><b>Nama:</b> ${nama}</p>
        <p><b>Paket:</b> ${paket == 1 ? "Kilat" : "Santuy"}</p>
        <p><b>Total Pembayaran:</b> ${estimasi}</p>
        <p><b>Status:</b> ${status}</p>

        <div class="capek-gw">
            <a href="/selesai/${id}">
                <button class="btn-konfirmasi">
                    Konfirmasi
                </button>
            </a>
        </div>
      
    `;

    document.getElementById("detailModalJadwal").style.display = "flex";
}

function showDetailStatus(
    id,
    nama,
    gender,
    wa,
    paket,
    estimasi,
    status
) {

    document.getElementById("detailBodyStatus").innerHTML = `
        <p><b>ID:</b> ${id}</p>
        <p><b>Nama:</b> ${nama}</p>
        <p><b>Gender:</b> ${gender}</p>
        <p><b>No WA:</b> ${wa}</p>
        <p><b>Paket:</b> ${paket == 1 ? "Kilat" : "Santuy"}</p>
        <p><b>Estimasi Selesai:</b> ${estimasi}</p>
        <p><b>Status:</b> ${status}</p>

        <div class="capek-gw">
            <a href="/selesai/${id}">
                <button class="btn-konfirmasi">
                    Konfirmasi
                </button>
            </a>
        </div>
    `;

    document.getElementById("detailModalStatus").style.display = "flex";
}

function closeDetailStatus() {

    document.getElementById(
        "detailModalStatus"
    ).style.display = "none";
}
