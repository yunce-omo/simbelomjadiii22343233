from flask import Flask, render_template, redirect, url_for,flash, request, session
from datetime import datetime, timedelta
import sqlite3

app=Flask(__name__)
app.secret_key = "rahasia123"

@app.route('/')
def home():
    return render_template('pages/login.html')

@app.route('/login', methods=['POST'])
def login():

    username = request.form['username']
    password = request.form['password']

    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM users
        WHERE username = ?
        AND password = ?
    """,(username,password))

    user = cursor.fetchone()

    conn.close()

    if user:

        session['username'] = admin
        session['role'] = admin123

        return redirect(url_for('dashboard'))
    else:
        flash("Username atau password salah")
        return redirect(url_for('home'))

# tandai
@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('home'))

    username = session['username']
    role = session['role']

    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()
    # Jadwal
    cursor.execute("""
    SELECT *
    FROM laundry
    WHERE tahap = 'Proses'
    """)
    rows = cursor.fetchall()
    # Pembelian
    cursor.execute("SELECT * FROM pembelian")
    rows_pembelian = cursor.fetchall()
    # Status
    cursor.execute("""
    SELECT *
    FROM laundry
    WHERE tahap = 'Selesai'
    """)
    selesai = cursor.fetchall()

    conn.close()

    hari_ini = datetime.now().date()
    tanggal=hari_ini.strftime("%d-%m-%Y")
    jumlah_hari_ini = 0
    
    data_laundry = []
    
    for row in rows:
        estimasi = datetime.strptime(
            row[7],
            "%d-%m-%Y"
        ).date()

        sisa_hari = (estimasi - hari_ini).days

        if sisa_hari == 0:
            status_tenggat = "Hari Ini"
            jumlah_hari_ini += 1
        elif sisa_hari == 1:
            status_tenggat = "Besok"
        elif sisa_hari == 2:
            status_tenggat = "2 Hari Lagi"
        elif sisa_hari == 3:
            status_tenggat = "3 Hari Lagi"
        elif sisa_hari < 0:
            status_tenggat = "Terlambat"
        else:
            status_tenggat = f"{sisa_hari} Hari Lagi"

        data_laundry.append({
            "id": row[0],
            "nama": row[1],
            "gender": row[2],
            "wa": row[3],
            "paket": row[4],
            "berat": row[5],
            "tanggal_masuk": row[6],
            "tanggal_selesai": row[7],
            "antar_jemput": row[8],
            "catatan": row[9],
            "status": row[10],

            # data tambahan
            "sisa_hari": sisa_hari,
            "status_tenggat": status_tenggat
        })
    
    data_pembelian = []

    for row in rows_pembelian:
        data_pembelian.append({
            "tanggal": row[0],
            "nama_barang": row[1],
            "kuantitas": row[2],
            "harga_satuan": row[3],
            "total": row[4],
            "supplier": row[5],
            "pencatat": row[6]
        })
    
    data_selesai = []

    for row in selesai:
        estimasi = datetime.strptime(
            row[7],
            "%d-%m-%Y"
        ).date()

        sisa_hari = (estimasi - hari_ini).days

        if sisa_hari < 0:
            status_tenggat = "Belum Diambil"
        else:
            status_tenggat = "Selesai"

        data_selesai.append({
            "id": row[0],
            "nama": row[1],
            "gender": row[2],
            "wa": row[3],
            "paket": row[4],
            "berat": row[5],
            "tanggal_masuk": row[6],
            "tanggal_selesai": row[7],
            "antar_jemput": row[8],
            "catatan": row[9],
            "status": row[10],

            # data tambahan
            "sisa_hari": sisa_hari,
            "status_tenggat": status_tenggat
        })

    return render_template(
        'index.html',
        data_laundry = data_laundry,
        jumlah_hari_ini = jumlah_hari_ini,
        username = username,
        role = role,
        tanggal = tanggal,
        data_pembelian = data_pembelian,
        data_selesai = data_selesai
    )
       

# LOGIKA DASHBOARD
@app.route('/dashboard1', methods=['POST'])
def dashboard1():
    nama_pelanggan_before = request.form['nama_pelanggan']
    nama_pelanggan = nama_pelanggan_before.title()
    jenis_kelamin = request.form['jenis_kelamin']
    wa = request.form['no_wa']
    paket_laundry = int(request.form['paket_laundry'])
    berat = float(request.form['berat'])
    tanggal_masuk = datetime.now()
    tanggal_selesai = tanggal_masuk + timedelta(days=paket_laundry)
    antar_jemput = request.form['antar_jemput']
    catatan = request.form['catatan']

    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO laundry (
            nama_pelanggan,
            jenis_kelamin,
            no_wa,
            paket_laundry,
            berat,
            tanggal_masuk,
            tanggal_selesai,
            antar_jemput,
            catatan,
            tahap
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """,(
        nama_pelanggan,
        jenis_kelamin,
        wa,
        paket_laundry,
        berat,
        tanggal_masuk.strftime("%d-%m-%Y"),
        tanggal_selesai.strftime("%d-%m-%Y"),
        antar_jemput,
        catatan,
        "Proses"
    ))
    conn.commit()
    conn.close()

    return redirect(url_for('dashboard'))

# LOGIKA PEMBELIAN
@app.route('/pembelian', methods=['POST'])
def pembelian():
    username = session['username']

    tanggal_beli = datetime.now()
    nama_barang_before = (request.form['nama_barang'])
    nama_barang = nama_barang_before.title()
    kuantitas = int(request.form['kuantitas'])
    harga_satuan = int(request.form['harga_satuan'])
    total = kuantitas*harga_satuan
    supplier_before = (request.form['supplier'])
    supplier = supplier_before.title()
    pencatat = username.title()

    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO pembelian (
            tanggal_beli,
            nama_barang,
            Kuantitas,
            harga_satuan,
            total,
            supplier,
            pencatat
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """,(
        tanggal_beli.strftime("%d-%m-%Y"),
        nama_barang,
        kuantitas,
        harga_satuan,
        total,
        supplier,
        pencatat,
    ))
    conn.commit()
    conn.close()

    return redirect(url_for('dashboard', tab = 'pembelian'))

# LOGIKA TAHAP
@app.route('/selesai/<int:id>')
def tahap(id):

    conn = sqlite3.connect('test.db')
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE laundry
        SET tahap='Selesai'
        WHERE id=?
    """,(id,))

    conn.commit()
    conn.close()

    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    app.run(debug=True)
